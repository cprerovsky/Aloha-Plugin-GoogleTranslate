Alhoa-Editor GoogleTranslate Plugin
===================================
This plugin will allow you to translate the contents you're editing by using the Google Translate API v2.

Known Issues
============
* At this time a fixed API key is used, which will most likely result in API errors, when more people use this plugin
* Any translation which returns special chars is broken, as the characters are inserted as symbols. This will result in broken text entries, eg. when translating english to french
* The Google Translate API will trim trailing and leading spaces, and therefore may mess up your text. This issue will occur when translating text which contains formatting