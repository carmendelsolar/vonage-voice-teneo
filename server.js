/**
 * Copyright 2019 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require("http");
const express = require("express");
const TIE = require("@artificialsolutions/tie-api-client");
const dotenv = require("dotenv");

dotenv.config();
const {
  WEBHOOK_FOR_VONAGE,
  PATH_TO_ANSWER,
  TENEO_ENGINE_URL,
  LANGUAGE_ASR,
  BARGEIN_ASR,
  LANGUAGE_TTS,
  STYLE_TTS,
  PORT,
} = process.env;
const port = PORT || 1337;
const teneoApi = TIE.init(TENEO_ENGINE_URL);
const language_ASR = LANGUAGE_ASR || "en-US"; // Final list to be added at a later date
const bargein_ASR = BARGEIN_ASR || false; 
const language_TTS = LANGUAGE_TTS || "en-US"; //See: https://developer.nexmo.com/voice/voice-api/guides/text-to-speech#supported-languages
const style_TTS = STYLE_TTS || 2; //See: https://developer.nexmo.com/voice/voice-api/guides/text-to-speech#supported-languages
const pathToAnswer = PATH_TO_ANSWER || "/webhooks/answer";

console.log("LANGUAGE (for ASR): " + language_ASR);
console.log("BARGEIN (for ASR): " + bargein_ASR);
console.log("LANGUAGE (for TTS): " + language_TTS);
console.log("STYLE (for TTS): " + style_TTS);

// Initialize session handler, to store mapping between Vonage call id and Teneo Engine session id
const sessionHandler = SessionHandler();

// Initialize an Express application
const app = express();
const router = express.Router();

// Tell express to use this router with /api before
app.use("/", router);

// Vonage message comes in
router.post(pathToAnswer, handleVonageMessages(sessionHandler));

// Handle incoming Vonage message
function handleVonageMessages(sessionHandler) {
  return (req, res) => {
    let body = "";
    req.on("data", function (data) {
      body += data;
    });

    req.on("end", async function () {
      // parse the body
      var post = JSON.parse(body);
      console.log("Vonage Request", post);

      // get the caller id
      const conversation_uuid = post.conversation_uuid;
      console.log(`conversation_uuid: ${conversation_uuid}`);

      // check if we have stored an engine sessionid for this caller
      const teneoSessionId = sessionHandler.getSession(conversation_uuid);

      let userInput = "";
      try {
        userInput = post.speech.results[0].text;
      } catch (err) {
        //console.log(err);
      }
      console.log(`userInput: ${userInput}`);

      // Send input to Teneo Engine using stored sessionid and retreive response
      const teneoResponse = await teneoApi.sendInput(teneoSessionId, {
        text: userInput,
        channel: "vonage_voice",
      });
      console.log(`teneoResponse: ${teneoResponse.output.text}`);

      // Store engine sessionid for this caller
      sessionHandler.setSession(conversation_uuid, teneoResponse.sessionId);

      // Prepare message to return to Vonage
      sendVonageMessage(teneoResponse, post, res);
    });
  };
}

function sendVonageMessage(teneoResponse, post, res) {
  console.log("Sending Vonage a message");
  const ncco = [
    {
      action: "talk",
      text: teneoResponse.output.text,
      language: language_TTS,
      style: style_TTS,
      bargeIn: bargein_ASR,
      loop: 1,
    },
    {
      action: "input",
      speech: {
        language: language_ASR,
        uuid: [post.uuid],
        endOnSilence: 1,
      },
      eventUrl: [WEBHOOK_FOR_VONAGE + pathToAnswer],
    },
  ];

  /*const hangupAction = [
     {
       action: "talk",
       eventType: "synchronous",
       text: teneoResponse.output.text,
       language: language_TTS,
       style: style_TTS,
       bargeIn: bargein_ASR,
       loop: 1,
     },
     {
       action: "hangup",
       eventType: "synchronous",
     },
   ];*/

  const hangupAction = [
    {
      action: "hangup",
      text: teneoResponse.output.text,
      language: language_TTS,
      style: style_TTS,
      bargeIn: false,
      loop: 1,
    },
  ];

  // https://developer.nexmo.com/voice/voice-api/ncco-reference
  const transferAction = [
    {
      action: "talk",
      text: teneoResponse.output.text,
      language: language_TTS,
      style: style_TTS,
      bargeIn: bargein_ASR,
      loop: 1,
    },
    {
      action: "connect",
      eventType: "synchronous",
      timeout: "45",
      from: post.to,
      endpoint: [
        {
          type: "phone",
          number: teneoResponse.output.parameters.toNumber,
        },
      ],
    },
  ];

  res.writeHead(200, { "Content-Type": "application/json" });
  if (teneoResponse.output.parameters.hangup) {
    console.log("Teneo instructs Vonage to hang up");
    res.end(JSON.stringify(hangupAction));
  } else if (teneoResponse.output.parameters.liveChat) {
    console.log(
      "Teneo instructs Vonage to transfer the call to ",
      teneoResponse.output.parameters.toNumber
    );
    res.end(JSON.stringify(transferAction));
  } else {
    //console.log("Sending ncco: ", ncco);
    res.end(JSON.stringify(ncco));
  }
}

/***
 * SESSION HANDLER
 ***/
function SessionHandler() {
  // Map the Vonage Conversation UUID to the teneo engine session id.
  // This code keeps the map in memory, which is ok for testing purposes
  // For production usage it is advised to make use of more resilient storage mechanisms like redis
  const sessionMap = new Map();

  return {
    getSession: (userId) => {
      if (sessionMap.size > 0) {
        return sessionMap.get(userId);
      } else {
        return "";
      }
    },
    setSession: (userId, sessionId) => {
      sessionMap.set(userId, sessionId);
    },
  };
}

// start the express application
http.createServer(app).listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
