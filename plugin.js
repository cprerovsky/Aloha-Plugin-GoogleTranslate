/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/
/**
 * register the plugin with unique name
 */
GENTICS.Aloha.GoogleTranslate = new GENTICS.Aloha.Plugin('com.gentics.aloha.plugins.GoogleTranslate');

/**
 * Configure the available languages
 */
//GENTICS.Aloha.GoogleTranslate.languages = ['en', 'de', 'fr', 'ru', 'pl'];

/**
 * Configure the available languages to translate to. A complete list of supported languages can be found here:
 * http://code.google.com/apis/language/translate/v2/using_rest.html
 */
GENTICS.Aloha.GoogleTranslate.translateLangs = [ 'en', 'de', 'fr' ];

/**
 * Google translate API key
 */
GENTICS.Aloha.GoogleTranslate.apiKey = "AIzaSyBgsTE6JQ5wsgERpi6m2xBY-9pCn2I5zcA";

/**
 * Initialize the plugin
 */
GENTICS.Aloha.GoogleTranslate.init = function () {
	var that = this;

	// use configured api key
	if (this.settings.apiKey) {
		this.apiKey = this.settings.apiKey;
	}
	
	// import our styles
	jQuery("head").append('<link rel="stylesheet" href="../plugins/com.gentics.aloha.plugins.GoogleTranslate/css/googleTranslatePlugin.css" />');
	
	// create buttons for all translation langs
	for (var i=0; i<this.translateLangs.length; i++) {
	    GENTICS.Aloha.FloatingMenu.addButton(
	        'GENTICS.Aloha.continuoustext',
	        new GENTICS.Aloha.ui.Button({
	            'iconClass' : 'GENTICS_button GENTICS_button_googleTranslate_' + that.translateLangs[i],
	            'size' : 'small',
	            'onclick' : function (a,b,c) { 
	        		// determine target lang using the icon class
	        		// there should obviously be a better way to
	        		// determine which button has been clicked...
	        		var targetLang = a.iconCls.replace("GENTICS_button GENTICS_button_googleTranslate_", "");
	        		that.translate(targetLang);
	        	},
	            'tooltip' : that.translateLangs[i],
	            'toggle' : false
	        }),
	        'Translate',
	        1
	    );
	}
};

/**
 * translate a text using the google translate api
 * @param target language
 * @return void
 */
GENTICS.Aloha.GoogleTranslate.translate = function (targetLang) {
	var that = this;
	var tree = GENTICS.Aloha.Selection.getRangeObject().getSelectionTree();
	var tSource = new Array();
	var c; // the current item
	for (var i=0; i<tree.length; i++) {
		c = tree[i];
		if (c.selection != "none") {
			if (c.selection == "full") {
				tSource.push(jQuery(c.domobj).text());
			} else if (c.selection == "partial") {
				tSource.push(
					jQuery(c.domobj).text().substring(c.startOffset, c.endOffset)
				);
			}
		}
	}
	
	if (tSource.length > 0) {
		var qparams = "";
		for (var i=0; i < tSource.length; i++) {
			qparams += "&q=" + tSource[i];
		}
		
		jQuery.ajax({ type: "GET",
			dataType: "jsonp",
			url: 'https://www.googleapis.com/language/translate/v2' + 
				'?key=' + this.apiKey +
				'&target=' + targetLang + '&prettyprint=false' +
				qparams,
			success: function(res) {
				// handle errors
				if (typeof res.error == "object") {
					that.log("ERROR", "Unable to translate. Error: [" + res.error.code + "] " + res.error.message);
					return false;
				}
			
				// translation successful
				if (res.data && res.data.translations) {
					that.applyTranslation(res.data.translations, tree);
				}
			}
		});
	}	
};

/**
 * apply a translation provided by google to the current selection
 * @param translations list of translations provided by google
 * @param tree the selection tree the translations will be applied to
 */
GENTICS.Aloha.GoogleTranslate.applyTranslation = function (translations, tree) {
	var key = 0;
	for (var i=0; i<tree.length; i++) {
		c = tree[i];
		if (c.selection != "none") {
			if (c.selection == "full") {
				this.replaceText(c, translations[key].translatedText);
			} else if (c.selection == "partial") {
				var txt = jQuery(c.domobj).text();
				var pre = txt.substring(0, c.startOffset);
				var post = txt.substring(c.endOffset, txt.length);
				this.replaceText(c, pre + translations[key].translatedText + post);
			}
			key++;
		}
	}
};

/**
 * replace text in a selectionTree
 * @param selectionTreeEntry a single selection tree entry where the text should be replaced
 * @param text replacement text
 * @return void
 */
GENTICS.Aloha.GoogleTranslate.replaceText = function (selectionTreeEntry, text) {
	// GoogleTranslate API will trim spaces so we have to check if
	// there was a leading or trailing space
	// check if the first char of the original string is a space
	if (selectionTreeEntry.domobj.textContent.substring(0,1) == ' ') {
		text = ' ' + text;
	}
	
	// check if the last character of the original string is a space
	if (selectionTreeEntry.domobj.textContent.substring(
			selectionTreeEntry.domobj.textContent.length-1,selectionTreeEntry.domobj.textContent.length) == ' ') {
		text = text + ' ';
	}
	
	// special treatment for text nodes, which have to be replaced
	if (selectionTreeEntry.domobj.nodeType == 3) {
		jQuery(selectionTreeEntry.domobj)
			.replaceWith(document
			.createTextNode(text)
		);
	} else {
		jQuery(selectionTreeEntry.domobj)
			.text(text);
	}
};