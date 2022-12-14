## Prerequisites

* Your bot needs to be published and you need to know the Teneo Engine URL.
* You will need a Vonage account with a 'Virtual Phone Number' configured in it. The steps to set up the account, configure billing, and buy a virtual number are described below. !!! Adding funds is required to buy a 'Virtual Phone Number'. $10 will suffice to purchase a number and start testing your application.
### Https
When running the connector locally, making the connector available via https is preferred. [ngrok](https://ngrok.com/) is recommended for this.

## Running the connector on Heroku
A Heroku account is required to deploy the connector online.

**Note: Starting November 28, 2022, free Heroku Dynos, free Heroku Postgres, and free Heroku Data for Redis® plans will no longer be available.**

Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=noborder)](https://heroku.com/deploy?template=https://github.com/carmendelsolar/vonage-voice-teneo)

In the 'Config Vars' section, add the following (required):
* **TENEO_ENGINE_URL:** Your Teneo Interaction Engine endpoint, which you can obtain from your publication environment in Teneo Studio. See: https://developers.artificial-solutions.com/engine/getting-started/publish-your-solution
* **WEBHOOK_FOR_VONAGE:** Application endpoint for deployed vonage-voice-teneo connector (e.g. https://vonage-voice-teneo.herokuapp.com). Please note DO NOT add a '/' to the end of this URL!

These are not required but can also be set:
* **LANGUAGE_ASR:** Language for ASR, defaults to en-US if not specified. See: https://developer.nexmo.com/voice/voice-api/guides/asr#supported-languages
* **BARGEIN_ASR:** Enables/disables barge-in feature for ASR, defaults to false if not specified (possible values: true/false). See: https://developer.nexmo.com/voice/voice-api/guides/asr#barge-in
* **LANGUAGE_TTS:** Language for TTS, defaults to en-US if not specified. See: https://developer.nexmo.com/voice/voice-api/guides/text-to-speech#locale
* **STYLE_TTS:** Preferred language style for TTS, defaults to 2 if not specified. See: https://developer.nexmo.com/voice/voice-api/guides/text-to-speech#locale
* **PORT:** Port to run the application on (defaults to 1337 if not specified)
* **PATH_TO_ANSWER:** Can be left empty. Defaults to '/webhooks/answer'

## Setting up Vonage

1. Create an Application: https://dashboard.nexmo.com/applications.  Ensure you enable "Voice" for your application, then set:
* "Answer URL" to HTTP POST: <WEBHOOK_FOR_VONAGE>+<PATH_TO_ANSWER> (external address for server this application runs on (local, NGROK, Heroku, etc.) e.g. https://ngrok.io/webhooks/answer. 
Note that <PATH_TO_ANSWER> defaults to "/webhooks/answer".
* "Event URL" to HTTP POST: <WEBHOOK_FOR_VONAGE> (external address for server this application runs on (local, NGROK, Heroku, etc.) e.g. https://localurl.com)
2. Add a number: https://dashboard.nexmo.com/your-numbers.  Link the application created in Step 1 to your number.

### Running the connector locally

Next, we need to make the connector available via https. We'll use [ngrok](https://ngrok.com) for this.

1. Start ngrok. The connector runs on port 1337 by default, so we need to start ngrok like this:

    ``` bash
    ngrok http 1337
    ```

2. Running the command above will display a public forwarding https URL. Copy it, we will use for the  `WEBHOOK_FOR_VONAGE` and `PATH_TO_ANSWER`variables in the .env file and vonage configuration.

3. Revisit the instructions on [setting up vonage ](#setting-up-vonage), substituting the URL values and add them as event and answer URLs:

    ``` bash
    https://yoururl.ngrok.io/webhook/answer
    https://yoururl.ngrok.io/
    ```
#### Setup & run a Node.js web app


1. Download or clone the connector source code:
    ```
    git clone https://github.com/artificialsolutions/vonage-voice-teneo.git
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Create a new file called .env based on template.env. add the URL of your engine. Optionally you can also specify the langauges for Speech To Text and Text To Speech:
    ```
    TENEO_ENGINE_URL=<your_engine_url>
    LANGUAGE_STT=en-US
    LANGUAGE_TTS=Polly.Joanna
    ```
4. Start the connector:
    ```
    node server.js
    ```
That's it! Call your Vonage number with your phone, and speak to your bot!
