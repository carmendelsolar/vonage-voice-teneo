## Running the connector on Heroku

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
* "Answer URL" to HTTP POST: <WEBHOOK_FOR_VONAGE>+<PATH_TO_ANSWER> (e.g. https://vonage-voice-teneo.herokuapp.com/webhooks/answer). Note that <PATH_TO_ANSWER> defaults to "/webhooks/answer".
* "Event URL" to HTTP POST: <WEBHOOK_FOR_VONAGE> (e.g. https://vonage-voice-teneo.herokuapp.com)
2. Add a number: https://dashboard.nexmo.com/your-numbers.  Link the application created in Step 1 to your number.
