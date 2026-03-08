/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "webpacks/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./doc/jquery-components.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./doc/jquery-components.js":
/*!**********************************!*\
  !*** ./doc/jquery-components.js ***!
  \**********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jquery_ui_themes_base_core_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery-ui/themes/base/core.css */ "./node_modules/jquery-ui/themes/base/core.css");
/* harmony import */ var jquery_ui_themes_base_core_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_themes_base_core_css__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery_ui_themes_base_button_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery-ui/themes/base/button.css */ "./node_modules/jquery-ui/themes/base/button.css");
/* harmony import */ var jquery_ui_themes_base_button_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_themes_base_button_css__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery_ui_themes_base_dialog_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery-ui/themes/base/dialog.css */ "./node_modules/jquery-ui/themes/base/dialog.css");
/* harmony import */ var jquery_ui_themes_base_dialog_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_themes_base_dialog_css__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var jquery_ui_themes_base_resizable_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jquery-ui/themes/base/resizable.css */ "./node_modules/jquery-ui/themes/base/resizable.css");
/* harmony import */ var jquery_ui_themes_base_resizable_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_themes_base_resizable_css__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var jquery_ui_themes_base_tabs_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! jquery-ui/themes/base/tabs.css */ "./node_modules/jquery-ui/themes/base/tabs.css");
/* harmony import */ var jquery_ui_themes_base_tabs_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_themes_base_tabs_css__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var jquery_ui_themes_base_theme_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! jquery-ui/themes/base/theme.css */ "./node_modules/jquery-ui/themes/base/theme.css");
/* harmony import */ var jquery_ui_themes_base_theme_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_themes_base_theme_css__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var jquery_contextmenu_dist_jquery_contextMenu_min_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! jquery-contextmenu/dist/jquery.contextMenu.min.css */ "./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css");
/* harmony import */ var jquery_contextmenu_dist_jquery_contextMenu_min_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(jquery_contextmenu_dist_jquery_contextMenu_min_css__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var jquery_ui_ui_widgets_dialog__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! jquery-ui/ui/widgets/dialog */ "./node_modules/jquery-ui/ui/widgets/dialog.js");
/* harmony import */ var jquery_ui_ui_widgets_dialog__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_ui_widgets_dialog__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var jquery_ui_ui_widgets_tabs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! jquery-ui/ui/widgets/tabs */ "./node_modules/jquery-ui/ui/widgets/tabs.js");
/* harmony import */ var jquery_ui_ui_widgets_tabs__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(jquery_ui_ui_widgets_tabs__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var jquery_contextmenu__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! jquery-contextmenu */ "./node_modules/jquery-contextmenu/dist/jquery.contextMenu.js");
/* harmony import */ var jquery_contextmenu__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(jquery_contextmenu__WEBPACK_IMPORTED_MODULE_10__);
// import 'jquery-ui/themes/base/base.css';








// import 'jquery-ui/themes/base/menu.css';
// import 'jquery-ui/themes/base/autocomplete.css';

window.$ = jquery__WEBPACK_IMPORTED_MODULE_7___default.a;
// import autocomplete from 'jquery-ui/ui/widgets/autocomplete';
// import widget      from 'jquery-ui/ui/widget.js';





/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css":
/*!***************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css ***!
  \***************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _font_context_menu_icons_eot_33lxn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./font/context-menu-icons.eot?33lxn */ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.eot?33lxn");
/* harmony import */ var _font_context_menu_icons_woff2_33lxn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./font/context-menu-icons.woff2?33lxn */ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.woff2?33lxn");
/* harmony import */ var _font_context_menu_icons_woff_33lxn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./font/context-menu-icons.woff?33lxn */ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.woff?33lxn");
/* harmony import */ var _font_context_menu_icons_ttf_33lxn__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./font/context-menu-icons.ttf?33lxn */ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.ttf?33lxn");
// Imports






var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_font_context_menu_icons_eot_33lxn__WEBPACK_IMPORTED_MODULE_2__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_font_context_menu_icons_eot_33lxn__WEBPACK_IMPORTED_MODULE_2__["default"], { hash: "#iefix" });
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_font_context_menu_icons_woff2_33lxn__WEBPACK_IMPORTED_MODULE_3__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_font_context_menu_icons_woff_33lxn__WEBPACK_IMPORTED_MODULE_4__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_4___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_font_context_menu_icons_ttf_33lxn__WEBPACK_IMPORTED_MODULE_5__["default"]);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "@charset \"UTF-8\";/*!\r\n * jQuery contextMenu - Plugin for simple contextMenu handling\r\n *\r\n * Version: v2.9.2\r\n *\r\n * Authors: Björn Brala (SWIS.nl), Rodney Rehm, Addy Osmani (patches for FF)\r\n * Web: http://swisnl.github.io/jQuery-contextMenu/\r\n *\r\n * Copyright (c) 2011-2020 SWIS BV and contributors\r\n *\r\n * Licensed under\r\n *   MIT License http://www.opensource.org/licenses/mit-license\r\n *\r\n * Date: 2020-05-13T13:55:37.023Z\r\n */@-webkit-keyframes cm-spin{0%{-webkit-transform:translateY(-50%) rotate(0);transform:translateY(-50%) rotate(0)}100%{-webkit-transform:translateY(-50%) rotate(359deg);transform:translateY(-50%) rotate(359deg)}}@-o-keyframes cm-spin{0%{-webkit-transform:translateY(-50%) rotate(0);-o-transform:translateY(-50%) rotate(0);transform:translateY(-50%) rotate(0)}100%{-webkit-transform:translateY(-50%) rotate(359deg);-o-transform:translateY(-50%) rotate(359deg);transform:translateY(-50%) rotate(359deg)}}@keyframes cm-spin{0%{-webkit-transform:translateY(-50%) rotate(0);-o-transform:translateY(-50%) rotate(0);transform:translateY(-50%) rotate(0)}100%{-webkit-transform:translateY(-50%) rotate(359deg);-o-transform:translateY(-50%) rotate(359deg);transform:translateY(-50%) rotate(359deg)}}@font-face{font-family:context-menu-icons;font-style:normal;font-weight:400;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");src:url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") format(\"embedded-opentype\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_4___ + ") format(\"truetype\")}.context-menu-icon-add:before{content:\"\\EA01\"}.context-menu-icon-copy:before{content:\"\\EA02\"}.context-menu-icon-cut:before{content:\"\\EA03\"}.context-menu-icon-delete:before{content:\"\\EA04\"}.context-menu-icon-edit:before{content:\"\\EA05\"}.context-menu-icon-loading:before{content:\"\\EA06\"}.context-menu-icon-paste:before{content:\"\\EA07\"}.context-menu-icon-quit:before{content:\"\\EA08\"}.context-menu-icon::before{position:absolute;top:50%;left:0;width:2em;font-family:context-menu-icons;font-size:1em;font-style:normal;font-weight:400;line-height:1;color:#2980b9;text-align:center;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);-o-transform:translateY(-50%);transform:translateY(-50%);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.context-menu-icon.context-menu-hover:before{color:#fff}.context-menu-icon.context-menu-disabled::before{color:#bbb}.context-menu-icon.context-menu-icon-loading:before{-webkit-animation:cm-spin 2s infinite;-o-animation:cm-spin 2s infinite;animation:cm-spin 2s infinite}.context-menu-icon.context-menu-icon--fa{display:list-item;font-family:inherit;line-height:inherit}.context-menu-icon.context-menu-icon--fa::before{position:absolute;top:50%;left:0;width:2em;font-family:FontAwesome;font-size:1em;font-style:normal;font-weight:400;line-height:1;color:#2980b9;text-align:center;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);-o-transform:translateY(-50%);transform:translateY(-50%);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.context-menu-icon.context-menu-icon--fa.context-menu-hover:before{color:#fff}.context-menu-icon.context-menu-icon--fa.context-menu-disabled::before{color:#bbb}.context-menu-icon.context-menu-icon--fa5{display:list-item;font-family:inherit;line-height:inherit}.context-menu-icon.context-menu-icon--fa5 i,.context-menu-icon.context-menu-icon--fa5 svg{position:absolute;top:.3em;left:.5em;color:#2980b9}.context-menu-icon.context-menu-icon--fa5.context-menu-hover>i,.context-menu-icon.context-menu-icon--fa5.context-menu-hover>svg{color:#fff}.context-menu-icon.context-menu-icon--fa5.context-menu-disabled i,.context-menu-icon.context-menu-icon--fa5.context-menu-disabled svg{color:#bbb}.context-menu-list{position:absolute;display:inline-block;min-width:13em;max-width:26em;padding:.25em 0;margin:.3em;font-family:inherit;font-size:inherit;list-style-type:none;background:#fff;border:1px solid #bebebe;border-radius:.2em;-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);box-shadow:0 2px 5px rgba(0,0,0,.5)}.context-menu-item{position:relative;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;padding:.2em 2em;color:#2f2f2f;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-color:#fff}.context-menu-separator{padding:0;margin:.35em 0;border-bottom:1px solid #e6e6e6}.context-menu-item>label>input,.context-menu-item>label>textarea{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}.context-menu-item.context-menu-hover{color:#fff;cursor:pointer;background-color:#2980b9}.context-menu-item.context-menu-disabled{color:#bbb;cursor:default;background-color:#fff}.context-menu-input.context-menu-hover{color:#2f2f2f;cursor:default}.context-menu-submenu:after{position:absolute;top:50%;right:.5em;z-index:1;width:0;height:0;content:'';border-color:transparent transparent transparent #2f2f2f;border-style:solid;border-width:.25em 0 .25em .25em;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);-o-transform:translateY(-50%);transform:translateY(-50%)}.context-menu-item.context-menu-input{padding:.3em .6em}.context-menu-input>label>*{vertical-align:top}.context-menu-input>label>input[type=checkbox],.context-menu-input>label>input[type=radio]{position:relative;top:.12em;margin-right:.4em}.context-menu-input>label{margin:0}.context-menu-input>label,.context-menu-input>label>input[type=text],.context-menu-input>label>select,.context-menu-input>label>textarea{display:block;width:100%;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.context-menu-input>label>textarea{height:7em}.context-menu-item>.context-menu-list{top:.3em;right:-.3em;display:none}.context-menu-item.context-menu-visible>.context-menu-list{display:block}.context-menu-accesskey{text-decoration:underline}\r\n/*# sourceMappingURL=jquery.contextMenu.min.css.map */\r\n", "",{"version":3,"sources":["webpack://node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css","webpack://node_modules/jquery-contextmenu/dist/jquery.contextMenu.css"],"names":[],"mappings":"AAAA,gBAAgB,CCChB;;;;;;;;;;;;;;EAeA,CAAA,2BAEI,GAAA,4CACA,CAAA,oCDEF,CAAA,KCCE,iDANJ,CAAA,yCDUA,CAAA,CAAA,sBCNE,GAAA,4CACE,CAAA,uCACA,CAAA,oCANJ,CAAA,KACE,iDACE,CAAA,4CACA,CAAA,yCDmBJ,CAAA,CAAA,mBAEI,GAAA,4CACK,CAAA,uCCjBT,CAAA,oCAEE,CAAA,KACA,iDACA,CAAA,4CACA,CAAA,yCDsBF,CAAA,CAAA,WCjBA,8BACE,CAAA,iBDmBA,CAAA,eChBA,CAAA,2CDmBA,CAAA,iPAGF,CAAA,8BCjBA,eAGA,CAAA,+BACE,eDqBF,CAAA,8BACE,eAGF,CAAA,iCCjBA,eDqBA,CAAA,+BCjBE,eDqBF,CAAA,kCCjBE,eDqBF,CAAA,gCACE,eAGF,CAAA,+BCpBE,eAGF,CAAA,2BACE,iBDsBA,CAAA,OCpBF,CAAA,MACE,CAAA,SDsBA,CAAA,8BCpBF,CAAA,aACE,CAAA,iBDsBA,CAAA,eACA,CAAA,aACA,CAAA,aCtBF,CAAA,iBACE,CAAA,kCACA,CAAA,8BACA,CAAA,6BACA,CAAA,0BDyBA,CAAA,kCACA,CAAA,iCAGF,CAAA,6CACE,UAGF,CAAA,iDACE,UAGF,CAAA,oDACE,qCCzBE,CAAA,gCACA,CAAA,6BD6BJ,CAAA,yCACE,iBACA,CAAA,mBCzBF,CAAA,mBD4BA,CAAA,iDCzBE,iBACA,CAAA,OD2BA,CAAA,MACA,CAAA,SACA,CAAA,uBACA,CAAA,aCzBA,CAAA,iBD2BA,CAAA,eCzBA,CAAA,aD2BA,CAAA,aACA,CAAA,iBCzBF,CAAA,kCACE,CAAA,8BACA,CAAA,6BACA,CAAA,0BD4BA,CAAA,kCC1BA,CAAA,iCD6BF,CAAA,mEC1BE,UD6BF,CAAA,uEC1BE,UD8BF,CAAA,0CC1BA,iBACE,CAAA,mBACA,CAAA,mBD6BF,CAAA,0FC5BE,iBACA,CAAA,QACA,CAAA,SACA,CAAA,aD+BF,CAAA,gIACE,UC9BF,CAAA,sIACE,UDmCF,CAAA,mBC/BA,iBDiCE,CAAA,oBC/BA,CAAA,cDiCA,CAAA,cACA,CAAA,eACA,CAAA,WACA,CAAA,mBClCF,CAAA,iBACE,CAAA,oBACA,CAAA,eACA,CAAA,wBDoCA,CAAA,kBClCF,CAAA,2CACE,CAAA,mCDsCF,CAAA,mBClCA,iBACE,CAAA,8BACA,CAAA,2BDoCQ,CAAA,sBClCV,CAAA,gBACE,CAAA,aACA,CAAA,wBACA,CAAA,qBACA,CAAA,oBACA,CAAA,gBACA,CAAA,qBDsCF,CAAA,wBACE,SACA,CAAA,cACA,CAAA,+BAGF,CAAA,iEAEE,wBCrCA,CAAA,qBACF,CAAA,oBACE,CAAA,gBAGF,CAAA,sCACE,UDuCA,CAAA,cCrCF,CAAA,wBDyCA,CAAA,yCCrCE,UACA,CAAA,cDuCA,CAAA,qBAGF,CAAA,uCCrCA,aDuCE,CAAA,cAGF,CAAA,4BACE,iBACA,CAAA,OCvCA,CAAA,UACA,CAAA,SDyCA,CAAA,OCvCF,CAAA,QACE,CAAA,UDyCA,CAAA,wDCvCF,CAAA,kBACE,CAAA,gCACA,CAAA,kCACA,CAAA,8BACA,CAAA,6BDyCQ,CAAA,0BAMV,CAAA,sCACE,iBAIF,CAAA,4BACE,kBAIF,CAAA,2FAEE,iBACA,CAAA,SACA,CAAA,iBAGF,CAAA,0BACE,QAGF,CAAA,yIAIE,aACA,CAAA,UACA,CAAA,6BACG,CAAA,0BACK,CAAA,qBAGV,CAAA,mCACE,UAGF,CAAA,sCACE,QAEA,CAAA,WACA,CAAA,YAGF,CAAA,2DACE,aAGF,CAAA,wBACE,yBAAiB;AApSnB,qDAAqD","sourcesContent":["@charset \"UTF-8\";/*!\r\n * jQuery contextMenu - Plugin for simple contextMenu handling\r\n *\r\n * Version: v2.9.0\r\n *\r\n * Authors: Björn Brala (SWIS.nl), Rodney Rehm, Addy Osmani (patches for FF)\r\n * Web: http://swisnl.github.io/jQuery-contextMenu/\r\n *\r\n * Copyright (c) 2011-2020 SWIS BV and contributors\r\n *\r\n * Licensed under\r\n *   MIT License http://www.opensource.org/licenses/mit-license\r\n *\r\n * Date: 2020-05-06T18:55:06.258Z\r\n */@-webkit-keyframes cm-spin{0%{-webkit-transform:translateY(-50%) rotate(0);transform:translateY(-50%) rotate(0)}100%{-webkit-transform:translateY(-50%) rotate(359deg);transform:translateY(-50%) rotate(359deg)}}@-o-keyframes cm-spin{0%{-webkit-transform:translateY(-50%) rotate(0);-o-transform:translateY(-50%) rotate(0);transform:translateY(-50%) rotate(0)}100%{-webkit-transform:translateY(-50%) rotate(359deg);-o-transform:translateY(-50%) rotate(359deg);transform:translateY(-50%) rotate(359deg)}}@keyframes cm-spin{0%{-webkit-transform:translateY(-50%) rotate(0);-o-transform:translateY(-50%) rotate(0);transform:translateY(-50%) rotate(0)}100%{-webkit-transform:translateY(-50%) rotate(359deg);-o-transform:translateY(-50%) rotate(359deg);transform:translateY(-50%) rotate(359deg)}}@font-face{font-family:context-menu-icons;font-style:normal;font-weight:400;src:url(font/context-menu-icons.eot?33lxn);src:url(font/context-menu-icons.eot?33lxn#iefix) format(\"embedded-opentype\"),url(font/context-menu-icons.woff2?33lxn) format(\"woff2\"),url(font/context-menu-icons.woff?33lxn) format(\"woff\"),url(font/context-menu-icons.ttf?33lxn) format(\"truetype\")}.context-menu-icon-add:before{content:\"\\EA01\"}.context-menu-icon-copy:before{content:\"\\EA02\"}.context-menu-icon-cut:before{content:\"\\EA03\"}.context-menu-icon-delete:before{content:\"\\EA04\"}.context-menu-icon-edit:before{content:\"\\EA05\"}.context-menu-icon-loading:before{content:\"\\EA06\"}.context-menu-icon-paste:before{content:\"\\EA07\"}.context-menu-icon-quit:before{content:\"\\EA08\"}.context-menu-icon::before{position:absolute;top:50%;left:0;width:2em;font-family:context-menu-icons;font-size:1em;font-style:normal;font-weight:400;line-height:1;color:#2980b9;text-align:center;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);-o-transform:translateY(-50%);transform:translateY(-50%);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.context-menu-icon.context-menu-hover:before{color:#fff}.context-menu-icon.context-menu-disabled::before{color:#bbb}.context-menu-icon.context-menu-icon-loading:before{-webkit-animation:cm-spin 2s infinite;-o-animation:cm-spin 2s infinite;animation:cm-spin 2s infinite}.context-menu-icon.context-menu-icon--fa{display:list-item;font-family:inherit;line-height:inherit}.context-menu-icon.context-menu-icon--fa::before{position:absolute;top:50%;left:0;width:2em;font-family:FontAwesome;font-size:1em;font-style:normal;font-weight:400;line-height:1;color:#2980b9;text-align:center;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);-o-transform:translateY(-50%);transform:translateY(-50%);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.context-menu-icon.context-menu-icon--fa.context-menu-hover:before{color:#fff}.context-menu-icon.context-menu-icon--fa.context-menu-disabled::before{color:#bbb}.context-menu-icon.context-menu-icon--fa5{display:list-item;font-family:inherit;line-height:inherit}.context-menu-icon.context-menu-icon--fa5 i,.context-menu-icon.context-menu-icon--fa5 svg{position:absolute;top:.3em;left:.5em;color:#2980b9}.context-menu-icon.context-menu-icon--fa5.context-menu-hover>i,.context-menu-icon.context-menu-icon--fa5.context-menu-hover>svg{color:#fff}.context-menu-icon.context-menu-icon--fa5.context-menu-disabled i,.context-menu-icon.context-menu-icon--fa5.context-menu-disabled svg{color:#bbb}.context-menu-list{position:absolute;display:inline-block;min-width:13em;max-width:26em;padding:.25em 0;margin:.3em;font-family:inherit;font-size:inherit;list-style-type:none;background:#fff;border:1px solid #bebebe;border-radius:.2em;-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);box-shadow:0 2px 5px rgba(0,0,0,.5)}.context-menu-item{position:relative;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;padding:.2em 2em;color:#2f2f2f;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-color:#fff}.context-menu-separator{padding:0;margin:.35em 0;border-bottom:1px solid #e6e6e6}.context-menu-item>label>input,.context-menu-item>label>textarea{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}.context-menu-item.context-menu-hover{color:#fff;cursor:pointer;background-color:#2980b9}.context-menu-item.context-menu-disabled{color:#bbb;cursor:default;background-color:#fff}.context-menu-input.context-menu-hover{color:#2f2f2f;cursor:default}.context-menu-submenu:after{position:absolute;top:50%;right:.5em;z-index:1;width:0;height:0;content:'';border-color:transparent transparent transparent #2f2f2f;border-style:solid;border-width:.25em 0 .25em .25em;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);-o-transform:translateY(-50%);transform:translateY(-50%)}.context-menu-item.context-menu-input{padding:.3em .6em}.context-menu-input>label>*{vertical-align:top}.context-menu-input>label>input[type=checkbox],.context-menu-input>label>input[type=radio]{position:relative;top:.12em;margin-right:.4em}.context-menu-input>label{margin:0}.context-menu-input>label,.context-menu-input>label>input[type=text],.context-menu-input>label>select,.context-menu-input>label>textarea{display:block;width:100%;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.context-menu-input>label>textarea{height:7em}.context-menu-item>.context-menu-list{top:.3em;right:-.3em;display:none}.context-menu-item.context-menu-visible>.context-menu-list{display:block}.context-menu-accesskey{text-decoration:underline}\r\n/*# sourceMappingURL=jquery.contextMenu.min.css.map */\r\n","@charset \"UTF-8\";\n/*!\r\n * jQuery contextMenu - Plugin for simple contextMenu handling\r\n *\r\n * Version: v2.9.2\r\n *\r\n * Authors: Björn Brala (SWIS.nl), Rodney Rehm, Addy Osmani (patches for FF)\r\n * Web: http://swisnl.github.io/jQuery-contextMenu/\r\n *\r\n * Copyright (c) 2011-2020 SWIS BV and contributors\r\n *\r\n * Licensed under\r\n *   MIT License http://www.opensource.org/licenses/mit-license\r\n *\r\n * Date: 2020-05-13T13:55:37.023Z\r\n */\n@keyframes cm-spin {\n  0% {\n    -webkit-transform: translateY(-50%) rotate(0deg);\n    transform: translateY(-50%) rotate(0deg); }\n  100% {\n    -webkit-transform: translateY(-50%) rotate(359deg);\n    transform: translateY(-50%) rotate(359deg); } }\n\n@font-face {\n  font-family: \"context-menu-icons\";\n  src: url(\"font/context-menu-icons.eot?33lxn\");\n  src: url(\"font/context-menu-icons.eot?33lxn#iefix\") format(\"embedded-opentype\"), url(\"font/context-menu-icons.woff2?33lxn\") format(\"woff2\"), url(\"font/context-menu-icons.woff?33lxn\") format(\"woff\"), url(\"font/context-menu-icons.ttf?33lxn\") format(\"truetype\");\n  font-weight: normal;\n  font-style: normal; }\n\n.context-menu-icon-add:before {\n  content: \"\\EA01\"; }\n\n.context-menu-icon-copy:before {\n  content: \"\\EA02\"; }\n\n.context-menu-icon-cut:before {\n  content: \"\\EA03\"; }\n\n.context-menu-icon-delete:before {\n  content: \"\\EA04\"; }\n\n.context-menu-icon-edit:before {\n  content: \"\\EA05\"; }\n\n.context-menu-icon-loading:before {\n  content: \"\\EA06\"; }\n\n.context-menu-icon-paste:before {\n  content: \"\\EA07\"; }\n\n.context-menu-icon-quit:before {\n  content: \"\\EA08\"; }\n\n.context-menu-icon::before {\n  color: #2980B9;\n  font-family: \"context-menu-icons\";\n  font-style: normal;\n  font-weight: normal;\n  font-size: 1em;\n  left: 0;\n  line-height: 1;\n  position: absolute;\n  text-align: center;\n  top: 50%;\n  transform: translateY(-50%);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  width: 2em; }\n\n.context-menu-icon.context-menu-hover:before {\n  color: #FFF; }\n\n.context-menu-icon.context-menu-disabled::before {\n  color: #bbbbbb; }\n\n.context-menu-icon.context-menu-icon-loading:before {\n  animation: cm-spin 2s infinite; }\n\n.context-menu-icon.context-menu-icon--fa {\n  display: list-item;\n  font-family: inherit;\n  line-height: inherit; }\n  .context-menu-icon.context-menu-icon--fa::before {\n    color: #2980B9;\n    font-family: FontAwesome;\n    font-style: normal;\n    font-weight: normal;\n    font-size: 1em;\n    left: 0;\n    line-height: 1;\n    position: absolute;\n    text-align: center;\n    top: 50%;\n    transform: translateY(-50%);\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    width: 2em; }\n  .context-menu-icon.context-menu-icon--fa.context-menu-hover:before {\n    color: #FFF; }\n  .context-menu-icon.context-menu-icon--fa.context-menu-disabled::before {\n    color: #bbbbbb; }\n\n.context-menu-icon.context-menu-icon--fa5 {\n  display: list-item;\n  font-family: inherit;\n  line-height: inherit; }\n  .context-menu-icon.context-menu-icon--fa5 i, .context-menu-icon.context-menu-icon--fa5 svg {\n    color: #2980B9;\n    left: 0.5em;\n    position: absolute;\n    top: 0.3em; }\n  .context-menu-icon.context-menu-icon--fa5.context-menu-hover > i, .context-menu-icon.context-menu-icon--fa5.context-menu-hover > svg {\n    color: #FFF; }\n  .context-menu-icon.context-menu-icon--fa5.context-menu-disabled i, .context-menu-icon.context-menu-icon--fa5.context-menu-disabled svg {\n    color: #bbbbbb; }\n\n.context-menu-list {\n  background: #FFF;\n  border: 1px solid #bebebe;\n  border-radius: 0.2em;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);\n  display: inline-block;\n  font-family: inherit;\n  font-size: inherit;\n  list-style-type: none;\n  margin: 0.3em;\n  max-width: 26em;\n  min-width: 13em;\n  padding: 0.25em 0;\n  position: absolute; }\n\n.context-menu-item {\n  background-color: #FFF;\n  box-sizing: content-box;\n  color: #2F2F2F;\n  padding: 0.2em 2em;\n  position: relative;\n  user-select: none; }\n\n.context-menu-separator {\n  border-bottom: 1px solid #e6e6e6;\n  margin: 0.35em 0;\n  padding: 0; }\n\n.context-menu-item > label > input,\n.context-menu-item > label > textarea {\n  user-select: text; }\n\n.context-menu-item.context-menu-hover {\n  background-color: #2980B9;\n  color: #FFF;\n  cursor: pointer; }\n\n.context-menu-item.context-menu-disabled {\n  background-color: #FFF;\n  color: #bbbbbb;\n  cursor: default; }\n\n.context-menu-input.context-menu-hover {\n  cursor: default;\n  color: #2F2F2F; }\n\n.context-menu-submenu:after {\n  content: '';\n  border-style: solid;\n  border-width: .25em 0 .25em .25em;\n  border-color: transparent transparent transparent #2F2F2F;\n  height: 0;\n  position: absolute;\n  right: .5em;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 0;\n  z-index: 1; }\n\n/**\r\n * Inputs\r\n */\n.context-menu-item.context-menu-input {\n  padding: .3em .6em; }\n\n/* vertically align inside labels */\n.context-menu-input > label > * {\n  vertical-align: top; }\n\n/* position checkboxes and radios as icons */\n.context-menu-input > label > input[type=\"checkbox\"],\n.context-menu-input > label > input[type=\"radio\"] {\n  margin-right: .4em;\n  position: relative;\n  top: .12em; }\n\n.context-menu-input > label {\n  margin: 0; }\n\n.context-menu-input > label,\n.context-menu-input > label > input[type=\"text\"],\n.context-menu-input > label > textarea,\n.context-menu-input > label > select {\n  box-sizing: border-box;\n  display: block;\n  width: 100%; }\n\n.context-menu-input > label > textarea {\n  height: 7em; }\n\n.context-menu-item > .context-menu-list {\n  display: none;\n  /* re-positioned by js */\n  right: -.3em;\n  top: .3em; }\n\n.context-menu-item.context-menu-visible > .context-menu-list {\n  display: block; }\n\n.context-menu-accesskey {\n  text-decoration: underline; }\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/button.css":
/*!*********************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/button.css ***!
  \*********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "/*!\n * jQuery UI Button 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/button/#theming\n */\n.ui-button {\n\tpadding: .4em 1em;\n\tdisplay: inline-block;\n\tposition: relative;\n\tline-height: normal;\n\tmargin-right: .1em;\n\tcursor: pointer;\n\tvertical-align: middle;\n\ttext-align: center;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\n\t/* Support: IE <= 11 */\n\toverflow: visible;\n}\n\n.ui-button,\n.ui-button:link,\n.ui-button:visited,\n.ui-button:hover,\n.ui-button:active {\n\ttext-decoration: none;\n}\n\n/* to make room for the icon, a width needs to be set here */\n.ui-button-icon-only {\n\twidth: 2em;\n\tbox-sizing: border-box;\n\ttext-indent: -9999px;\n\twhite-space: nowrap;\n}\n\n/* no icon support for input elements */\ninput.ui-button.ui-button-icon-only {\n\ttext-indent: 0;\n}\n\n/* button icon element(s) */\n.ui-button-icon-only .ui-icon {\n\tposition: absolute;\n\ttop: 50%;\n\tleft: 50%;\n\tmargin-top: -8px;\n\tmargin-left: -8px;\n}\n\n.ui-button.ui-icon-notext .ui-icon {\n\tpadding: 0;\n\twidth: 2.1em;\n\theight: 2.1em;\n\ttext-indent: -9999px;\n\twhite-space: nowrap;\n\n}\n\ninput.ui-button.ui-icon-notext .ui-icon {\n\twidth: auto;\n\theight: auto;\n\ttext-indent: 0;\n\twhite-space: normal;\n\tpadding: .4em 1em;\n}\n\n/* workarounds */\n/* Support: Firefox 5 - 40 */\ninput.ui-button::-moz-focus-inner,\nbutton.ui-button::-moz-focus-inner {\n\tborder: 0;\n\tpadding: 0;\n}\n", "",{"version":3,"sources":["webpack://node_modules/jquery-ui/themes/base/button.css"],"names":[],"mappings":"AAAA;;;;;;;;;EASE;AACF;CACC,iBAAiB;CACjB,qBAAqB;CACrB,kBAAkB;CAClB,mBAAmB;CACnB,kBAAkB;CAClB,eAAe;CACf,sBAAsB;CACtB,kBAAkB;CAClB,yBAAyB;CACzB,sBAAsB;CACtB,qBAAqB;CACrB,iBAAiB;;CAEjB,sBAAsB;CACtB,iBAAiB;AAClB;;AAEA;;;;;CAKC,qBAAqB;AACtB;;AAEA,4DAA4D;AAC5D;CACC,UAAU;CACV,sBAAsB;CACtB,oBAAoB;CACpB,mBAAmB;AACpB;;AAEA,uCAAuC;AACvC;CACC,cAAc;AACf;;AAEA,2BAA2B;AAC3B;CACC,kBAAkB;CAClB,QAAQ;CACR,SAAS;CACT,gBAAgB;CAChB,iBAAiB;AAClB;;AAEA;CACC,UAAU;CACV,YAAY;CACZ,aAAa;CACb,oBAAoB;CACpB,mBAAmB;;AAEpB;;AAEA;CACC,WAAW;CACX,YAAY;CACZ,cAAc;CACd,mBAAmB;CACnB,iBAAiB;AAClB;;AAEA,gBAAgB;AAChB,4BAA4B;AAC5B;;CAEC,SAAS;CACT,UAAU;AACX","sourcesContent":["/*!\n * jQuery UI Button 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/button/#theming\n */\n.ui-button {\n\tpadding: .4em 1em;\n\tdisplay: inline-block;\n\tposition: relative;\n\tline-height: normal;\n\tmargin-right: .1em;\n\tcursor: pointer;\n\tvertical-align: middle;\n\ttext-align: center;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\n\t/* Support: IE <= 11 */\n\toverflow: visible;\n}\n\n.ui-button,\n.ui-button:link,\n.ui-button:visited,\n.ui-button:hover,\n.ui-button:active {\n\ttext-decoration: none;\n}\n\n/* to make room for the icon, a width needs to be set here */\n.ui-button-icon-only {\n\twidth: 2em;\n\tbox-sizing: border-box;\n\ttext-indent: -9999px;\n\twhite-space: nowrap;\n}\n\n/* no icon support for input elements */\ninput.ui-button.ui-button-icon-only {\n\ttext-indent: 0;\n}\n\n/* button icon element(s) */\n.ui-button-icon-only .ui-icon {\n\tposition: absolute;\n\ttop: 50%;\n\tleft: 50%;\n\tmargin-top: -8px;\n\tmargin-left: -8px;\n}\n\n.ui-button.ui-icon-notext .ui-icon {\n\tpadding: 0;\n\twidth: 2.1em;\n\theight: 2.1em;\n\ttext-indent: -9999px;\n\twhite-space: nowrap;\n\n}\n\ninput.ui-button.ui-icon-notext .ui-icon {\n\twidth: auto;\n\theight: auto;\n\ttext-indent: 0;\n\twhite-space: normal;\n\tpadding: .4em 1em;\n}\n\n/* workarounds */\n/* Support: Firefox 5 - 40 */\ninput.ui-button::-moz-focus-inner,\nbutton.ui-button::-moz-focus-inner {\n\tborder: 0;\n\tpadding: 0;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/core.css":
/*!*******************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/core.css ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "/*!\n * jQuery UI CSS Framework 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/category/theming/\n */\n\n/* Layout helpers\n----------------------------------*/\n.ui-helper-hidden {\n\tdisplay: none;\n}\n.ui-helper-hidden-accessible {\n\tborder: 0;\n\tclip: rect(0 0 0 0);\n\theight: 1px;\n\tmargin: -1px;\n\toverflow: hidden;\n\tpadding: 0;\n\tposition: absolute;\n\twidth: 1px;\n}\n.ui-helper-reset {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\toutline: 0;\n\tline-height: 1.3;\n\ttext-decoration: none;\n\tfont-size: 100%;\n\tlist-style: none;\n}\n.ui-helper-clearfix:before,\n.ui-helper-clearfix:after {\n\tcontent: \"\";\n\tdisplay: table;\n\tborder-collapse: collapse;\n}\n.ui-helper-clearfix:after {\n\tclear: both;\n}\n.ui-helper-zfix {\n\twidth: 100%;\n\theight: 100%;\n\ttop: 0;\n\tleft: 0;\n\tposition: absolute;\n\topacity: 0;\n\tfilter:Alpha(Opacity=0); /* support: IE8 */\n}\n\n.ui-front {\n\tz-index: 100;\n}\n\n\n/* Interaction Cues\n----------------------------------*/\n.ui-state-disabled {\n\tcursor: default !important;\n\tpointer-events: none;\n}\n\n\n/* Icons\n----------------------------------*/\n.ui-icon {\n\tdisplay: inline-block;\n\tvertical-align: middle;\n\tmargin-top: -.25em;\n\tposition: relative;\n\ttext-indent: -99999px;\n\toverflow: hidden;\n\tbackground-repeat: no-repeat;\n}\n\n.ui-widget-icon-block {\n\tleft: 50%;\n\tmargin-left: -8px;\n\tdisplay: block;\n}\n\n/* Misc visuals\n----------------------------------*/\n\n/* Overlays */\n.ui-widget-overlay {\n\tposition: fixed;\n\ttop: 0;\n\tleft: 0;\n\twidth: 100%;\n\theight: 100%;\n}\n", "",{"version":3,"sources":["webpack://node_modules/jquery-ui/themes/base/core.css"],"names":[],"mappings":"AAAA;;;;;;;;;EASE;;AAEF;mCACmC;AACnC;CACC,aAAa;AACd;AACA;CACC,SAAS;CACT,mBAAmB;CACnB,WAAW;CACX,YAAY;CACZ,gBAAgB;CAChB,UAAU;CACV,kBAAkB;CAClB,UAAU;AACX;AACA;CACC,SAAS;CACT,UAAU;CACV,SAAS;CACT,UAAU;CACV,gBAAgB;CAChB,qBAAqB;CACrB,eAAe;CACf,gBAAgB;AACjB;AACA;;CAEC,WAAW;CACX,cAAc;CACd,yBAAyB;AAC1B;AACA;CACC,WAAW;AACZ;AACA;CACC,WAAW;CACX,YAAY;CACZ,MAAM;CACN,OAAO;CACP,kBAAkB;CAClB,UAAU;CACV,uBAAuB,EAAE,iBAAiB;AAC3C;;AAEA;CACC,YAAY;AACb;;;AAGA;mCACmC;AACnC;CACC,0BAA0B;CAC1B,oBAAoB;AACrB;;;AAGA;mCACmC;AACnC;CACC,qBAAqB;CACrB,sBAAsB;CACtB,kBAAkB;CAClB,kBAAkB;CAClB,qBAAqB;CACrB,gBAAgB;CAChB,4BAA4B;AAC7B;;AAEA;CACC,SAAS;CACT,iBAAiB;CACjB,cAAc;AACf;;AAEA;mCACmC;;AAEnC,aAAa;AACb;CACC,eAAe;CACf,MAAM;CACN,OAAO;CACP,WAAW;CACX,YAAY;AACb","sourcesContent":["/*!\n * jQuery UI CSS Framework 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/category/theming/\n */\n\n/* Layout helpers\n----------------------------------*/\n.ui-helper-hidden {\n\tdisplay: none;\n}\n.ui-helper-hidden-accessible {\n\tborder: 0;\n\tclip: rect(0 0 0 0);\n\theight: 1px;\n\tmargin: -1px;\n\toverflow: hidden;\n\tpadding: 0;\n\tposition: absolute;\n\twidth: 1px;\n}\n.ui-helper-reset {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\toutline: 0;\n\tline-height: 1.3;\n\ttext-decoration: none;\n\tfont-size: 100%;\n\tlist-style: none;\n}\n.ui-helper-clearfix:before,\n.ui-helper-clearfix:after {\n\tcontent: \"\";\n\tdisplay: table;\n\tborder-collapse: collapse;\n}\n.ui-helper-clearfix:after {\n\tclear: both;\n}\n.ui-helper-zfix {\n\twidth: 100%;\n\theight: 100%;\n\ttop: 0;\n\tleft: 0;\n\tposition: absolute;\n\topacity: 0;\n\tfilter:Alpha(Opacity=0); /* support: IE8 */\n}\n\n.ui-front {\n\tz-index: 100;\n}\n\n\n/* Interaction Cues\n----------------------------------*/\n.ui-state-disabled {\n\tcursor: default !important;\n\tpointer-events: none;\n}\n\n\n/* Icons\n----------------------------------*/\n.ui-icon {\n\tdisplay: inline-block;\n\tvertical-align: middle;\n\tmargin-top: -.25em;\n\tposition: relative;\n\ttext-indent: -99999px;\n\toverflow: hidden;\n\tbackground-repeat: no-repeat;\n}\n\n.ui-widget-icon-block {\n\tleft: 50%;\n\tmargin-left: -8px;\n\tdisplay: block;\n}\n\n/* Misc visuals\n----------------------------------*/\n\n/* Overlays */\n.ui-widget-overlay {\n\tposition: fixed;\n\ttop: 0;\n\tleft: 0;\n\twidth: 100%;\n\theight: 100%;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/dialog.css":
/*!*********************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/dialog.css ***!
  \*********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "/*!\n * jQuery UI Dialog 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/dialog/#theming\n */\n.ui-dialog {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tpadding: .2em;\n\toutline: 0;\n}\n.ui-dialog .ui-dialog-titlebar {\n\tpadding: .4em 1em;\n\tposition: relative;\n}\n.ui-dialog .ui-dialog-title {\n\tfloat: left;\n\tmargin: .1em 0;\n\twhite-space: nowrap;\n\twidth: 90%;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n}\n.ui-dialog .ui-dialog-titlebar-close {\n\tposition: absolute;\n\tright: .3em;\n\ttop: 50%;\n\twidth: 20px;\n\tmargin: -10px 0 0 0;\n\tpadding: 1px;\n\theight: 20px;\n}\n.ui-dialog .ui-dialog-content {\n\tposition: relative;\n\tborder: 0;\n\tpadding: .5em 1em;\n\tbackground: none;\n\toverflow: auto;\n}\n.ui-dialog .ui-dialog-buttonpane {\n\ttext-align: left;\n\tborder-width: 1px 0 0 0;\n\tbackground-image: none;\n\tmargin-top: .5em;\n\tpadding: .3em 1em .5em .4em;\n}\n.ui-dialog .ui-dialog-buttonpane .ui-dialog-buttonset {\n\tfloat: right;\n}\n.ui-dialog .ui-dialog-buttonpane button {\n\tmargin: .5em .4em .5em 0;\n\tcursor: pointer;\n}\n.ui-dialog .ui-resizable-n {\n\theight: 2px;\n\ttop: 0;\n}\n.ui-dialog .ui-resizable-e {\n\twidth: 2px;\n\tright: 0;\n}\n.ui-dialog .ui-resizable-s {\n\theight: 2px;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-w {\n\twidth: 2px;\n\tleft: 0;\n}\n.ui-dialog .ui-resizable-se,\n.ui-dialog .ui-resizable-sw,\n.ui-dialog .ui-resizable-ne,\n.ui-dialog .ui-resizable-nw {\n\twidth: 7px;\n\theight: 7px;\n}\n.ui-dialog .ui-resizable-se {\n\tright: 0;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-sw {\n\tleft: 0;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-ne {\n\tright: 0;\n\ttop: 0;\n}\n.ui-dialog .ui-resizable-nw {\n\tleft: 0;\n\ttop: 0;\n}\n.ui-draggable .ui-dialog-titlebar {\n\tcursor: move;\n}\n", "",{"version":3,"sources":["webpack://node_modules/jquery-ui/themes/base/dialog.css"],"names":[],"mappings":"AAAA;;;;;;;;;EASE;AACF;CACC,kBAAkB;CAClB,MAAM;CACN,OAAO;CACP,aAAa;CACb,UAAU;AACX;AACA;CACC,iBAAiB;CACjB,kBAAkB;AACnB;AACA;CACC,WAAW;CACX,cAAc;CACd,mBAAmB;CACnB,UAAU;CACV,gBAAgB;CAChB,uBAAuB;AACxB;AACA;CACC,kBAAkB;CAClB,WAAW;CACX,QAAQ;CACR,WAAW;CACX,mBAAmB;CACnB,YAAY;CACZ,YAAY;AACb;AACA;CACC,kBAAkB;CAClB,SAAS;CACT,iBAAiB;CACjB,gBAAgB;CAChB,cAAc;AACf;AACA;CACC,gBAAgB;CAChB,uBAAuB;CACvB,sBAAsB;CACtB,gBAAgB;CAChB,2BAA2B;AAC5B;AACA;CACC,YAAY;AACb;AACA;CACC,wBAAwB;CACxB,eAAe;AAChB;AACA;CACC,WAAW;CACX,MAAM;AACP;AACA;CACC,UAAU;CACV,QAAQ;AACT;AACA;CACC,WAAW;CACX,SAAS;AACV;AACA;CACC,UAAU;CACV,OAAO;AACR;AACA;;;;CAIC,UAAU;CACV,WAAW;AACZ;AACA;CACC,QAAQ;CACR,SAAS;AACV;AACA;CACC,OAAO;CACP,SAAS;AACV;AACA;CACC,QAAQ;CACR,MAAM;AACP;AACA;CACC,OAAO;CACP,MAAM;AACP;AACA;CACC,YAAY;AACb","sourcesContent":["/*!\n * jQuery UI Dialog 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/dialog/#theming\n */\n.ui-dialog {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tpadding: .2em;\n\toutline: 0;\n}\n.ui-dialog .ui-dialog-titlebar {\n\tpadding: .4em 1em;\n\tposition: relative;\n}\n.ui-dialog .ui-dialog-title {\n\tfloat: left;\n\tmargin: .1em 0;\n\twhite-space: nowrap;\n\twidth: 90%;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n}\n.ui-dialog .ui-dialog-titlebar-close {\n\tposition: absolute;\n\tright: .3em;\n\ttop: 50%;\n\twidth: 20px;\n\tmargin: -10px 0 0 0;\n\tpadding: 1px;\n\theight: 20px;\n}\n.ui-dialog .ui-dialog-content {\n\tposition: relative;\n\tborder: 0;\n\tpadding: .5em 1em;\n\tbackground: none;\n\toverflow: auto;\n}\n.ui-dialog .ui-dialog-buttonpane {\n\ttext-align: left;\n\tborder-width: 1px 0 0 0;\n\tbackground-image: none;\n\tmargin-top: .5em;\n\tpadding: .3em 1em .5em .4em;\n}\n.ui-dialog .ui-dialog-buttonpane .ui-dialog-buttonset {\n\tfloat: right;\n}\n.ui-dialog .ui-dialog-buttonpane button {\n\tmargin: .5em .4em .5em 0;\n\tcursor: pointer;\n}\n.ui-dialog .ui-resizable-n {\n\theight: 2px;\n\ttop: 0;\n}\n.ui-dialog .ui-resizable-e {\n\twidth: 2px;\n\tright: 0;\n}\n.ui-dialog .ui-resizable-s {\n\theight: 2px;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-w {\n\twidth: 2px;\n\tleft: 0;\n}\n.ui-dialog .ui-resizable-se,\n.ui-dialog .ui-resizable-sw,\n.ui-dialog .ui-resizable-ne,\n.ui-dialog .ui-resizable-nw {\n\twidth: 7px;\n\theight: 7px;\n}\n.ui-dialog .ui-resizable-se {\n\tright: 0;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-sw {\n\tleft: 0;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-ne {\n\tright: 0;\n\ttop: 0;\n}\n.ui-dialog .ui-resizable-nw {\n\tleft: 0;\n\ttop: 0;\n}\n.ui-draggable .ui-dialog-titlebar {\n\tcursor: move;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/resizable.css":
/*!************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/resizable.css ***!
  \************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "/*!\n * jQuery UI Resizable 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n */\n.ui-resizable {\n\tposition: relative;\n}\n.ui-resizable-handle {\n\tposition: absolute;\n\tfont-size: 0.1px;\n\tdisplay: block;\n\t-ms-touch-action: none;\n\ttouch-action: none;\n}\n.ui-resizable-disabled .ui-resizable-handle,\n.ui-resizable-autohide .ui-resizable-handle {\n\tdisplay: none;\n}\n.ui-resizable-n {\n\tcursor: n-resize;\n\theight: 7px;\n\twidth: 100%;\n\ttop: -5px;\n\tleft: 0;\n}\n.ui-resizable-s {\n\tcursor: s-resize;\n\theight: 7px;\n\twidth: 100%;\n\tbottom: -5px;\n\tleft: 0;\n}\n.ui-resizable-e {\n\tcursor: e-resize;\n\twidth: 7px;\n\tright: -5px;\n\ttop: 0;\n\theight: 100%;\n}\n.ui-resizable-w {\n\tcursor: w-resize;\n\twidth: 7px;\n\tleft: -5px;\n\ttop: 0;\n\theight: 100%;\n}\n.ui-resizable-se {\n\tcursor: se-resize;\n\twidth: 12px;\n\theight: 12px;\n\tright: 1px;\n\tbottom: 1px;\n}\n.ui-resizable-sw {\n\tcursor: sw-resize;\n\twidth: 9px;\n\theight: 9px;\n\tleft: -5px;\n\tbottom: -5px;\n}\n.ui-resizable-nw {\n\tcursor: nw-resize;\n\twidth: 9px;\n\theight: 9px;\n\tleft: -5px;\n\ttop: -5px;\n}\n.ui-resizable-ne {\n\tcursor: ne-resize;\n\twidth: 9px;\n\theight: 9px;\n\tright: -5px;\n\ttop: -5px;\n}\n", "",{"version":3,"sources":["webpack://node_modules/jquery-ui/themes/base/resizable.css"],"names":[],"mappings":"AAAA;;;;;;;EAOE;AACF;CACC,kBAAkB;AACnB;AACA;CACC,kBAAkB;CAClB,gBAAgB;CAChB,cAAc;CACd,sBAAsB;CACtB,kBAAkB;AACnB;AACA;;CAEC,aAAa;AACd;AACA;CACC,gBAAgB;CAChB,WAAW;CACX,WAAW;CACX,SAAS;CACT,OAAO;AACR;AACA;CACC,gBAAgB;CAChB,WAAW;CACX,WAAW;CACX,YAAY;CACZ,OAAO;AACR;AACA;CACC,gBAAgB;CAChB,UAAU;CACV,WAAW;CACX,MAAM;CACN,YAAY;AACb;AACA;CACC,gBAAgB;CAChB,UAAU;CACV,UAAU;CACV,MAAM;CACN,YAAY;AACb;AACA;CACC,iBAAiB;CACjB,WAAW;CACX,YAAY;CACZ,UAAU;CACV,WAAW;AACZ;AACA;CACC,iBAAiB;CACjB,UAAU;CACV,WAAW;CACX,UAAU;CACV,YAAY;AACb;AACA;CACC,iBAAiB;CACjB,UAAU;CACV,WAAW;CACX,UAAU;CACV,SAAS;AACV;AACA;CACC,iBAAiB;CACjB,UAAU;CACV,WAAW;CACX,WAAW;CACX,SAAS;AACV","sourcesContent":["/*!\n * jQuery UI Resizable 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n */\n.ui-resizable {\n\tposition: relative;\n}\n.ui-resizable-handle {\n\tposition: absolute;\n\tfont-size: 0.1px;\n\tdisplay: block;\n\t-ms-touch-action: none;\n\ttouch-action: none;\n}\n.ui-resizable-disabled .ui-resizable-handle,\n.ui-resizable-autohide .ui-resizable-handle {\n\tdisplay: none;\n}\n.ui-resizable-n {\n\tcursor: n-resize;\n\theight: 7px;\n\twidth: 100%;\n\ttop: -5px;\n\tleft: 0;\n}\n.ui-resizable-s {\n\tcursor: s-resize;\n\theight: 7px;\n\twidth: 100%;\n\tbottom: -5px;\n\tleft: 0;\n}\n.ui-resizable-e {\n\tcursor: e-resize;\n\twidth: 7px;\n\tright: -5px;\n\ttop: 0;\n\theight: 100%;\n}\n.ui-resizable-w {\n\tcursor: w-resize;\n\twidth: 7px;\n\tleft: -5px;\n\ttop: 0;\n\theight: 100%;\n}\n.ui-resizable-se {\n\tcursor: se-resize;\n\twidth: 12px;\n\theight: 12px;\n\tright: 1px;\n\tbottom: 1px;\n}\n.ui-resizable-sw {\n\tcursor: sw-resize;\n\twidth: 9px;\n\theight: 9px;\n\tleft: -5px;\n\tbottom: -5px;\n}\n.ui-resizable-nw {\n\tcursor: nw-resize;\n\twidth: 9px;\n\theight: 9px;\n\tleft: -5px;\n\ttop: -5px;\n}\n.ui-resizable-ne {\n\tcursor: ne-resize;\n\twidth: 9px;\n\theight: 9px;\n\tright: -5px;\n\ttop: -5px;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/tabs.css":
/*!*******************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/tabs.css ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "/*!\n * jQuery UI Tabs 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/tabs/#theming\n */\n.ui-tabs {\n\tposition: relative;/* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear as \"fixed\") */\n\tpadding: .2em;\n}\n.ui-tabs .ui-tabs-nav {\n\tmargin: 0;\n\tpadding: .2em .2em 0;\n}\n.ui-tabs .ui-tabs-nav li {\n\tlist-style: none;\n\tfloat: left;\n\tposition: relative;\n\ttop: 0;\n\tmargin: 1px .2em 0 0;\n\tborder-bottom-width: 0;\n\tpadding: 0;\n\twhite-space: nowrap;\n}\n.ui-tabs .ui-tabs-nav .ui-tabs-anchor {\n\tfloat: left;\n\tpadding: .5em 1em;\n\ttext-decoration: none;\n}\n.ui-tabs .ui-tabs-nav li.ui-tabs-active {\n\tmargin-bottom: -1px;\n\tpadding-bottom: 1px;\n}\n.ui-tabs .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor,\n.ui-tabs .ui-tabs-nav li.ui-state-disabled .ui-tabs-anchor,\n.ui-tabs .ui-tabs-nav li.ui-tabs-loading .ui-tabs-anchor {\n\tcursor: text;\n}\n.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor {\n\tcursor: pointer;\n}\n.ui-tabs .ui-tabs-panel {\n\tdisplay: block;\n\tborder-width: 0;\n\tpadding: 1em 1.4em;\n\tbackground: none;\n}\n", "",{"version":3,"sources":["webpack://node_modules/jquery-ui/themes/base/tabs.css"],"names":[],"mappings":"AAAA;;;;;;;;;EASE;AACF;CACC,kBAAkB,CAAC,uIAAuI;CAC1J,aAAa;AACd;AACA;CACC,SAAS;CACT,oBAAoB;AACrB;AACA;CACC,gBAAgB;CAChB,WAAW;CACX,kBAAkB;CAClB,MAAM;CACN,oBAAoB;CACpB,sBAAsB;CACtB,UAAU;CACV,mBAAmB;AACpB;AACA;CACC,WAAW;CACX,iBAAiB;CACjB,qBAAqB;AACtB;AACA;CACC,mBAAmB;CACnB,mBAAmB;AACpB;AACA;;;CAGC,YAAY;AACb;AACA;CACC,eAAe;AAChB;AACA;CACC,cAAc;CACd,eAAe;CACf,kBAAkB;CAClB,gBAAgB;AACjB","sourcesContent":["/*!\n * jQuery UI Tabs 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/tabs/#theming\n */\n.ui-tabs {\n\tposition: relative;/* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear as \"fixed\") */\n\tpadding: .2em;\n}\n.ui-tabs .ui-tabs-nav {\n\tmargin: 0;\n\tpadding: .2em .2em 0;\n}\n.ui-tabs .ui-tabs-nav li {\n\tlist-style: none;\n\tfloat: left;\n\tposition: relative;\n\ttop: 0;\n\tmargin: 1px .2em 0 0;\n\tborder-bottom-width: 0;\n\tpadding: 0;\n\twhite-space: nowrap;\n}\n.ui-tabs .ui-tabs-nav .ui-tabs-anchor {\n\tfloat: left;\n\tpadding: .5em 1em;\n\ttext-decoration: none;\n}\n.ui-tabs .ui-tabs-nav li.ui-tabs-active {\n\tmargin-bottom: -1px;\n\tpadding-bottom: 1px;\n}\n.ui-tabs .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor,\n.ui-tabs .ui-tabs-nav li.ui-state-disabled .ui-tabs-anchor,\n.ui-tabs .ui-tabs-nav li.ui-tabs-loading .ui-tabs-anchor {\n\tcursor: text;\n}\n.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor {\n\tcursor: pointer;\n}\n.ui-tabs .ui-tabs-panel {\n\tdisplay: block;\n\tborder-width: 0;\n\tpadding: 1em 1.4em;\n\tbackground: none;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/theme.css":
/*!********************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/theme.css ***!
  \********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _images_ui_icons_444444_256x240_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./images/ui-icons_444444_256x240.png */ "./node_modules/jquery-ui/themes/base/images/ui-icons_444444_256x240.png");
/* harmony import */ var _images_ui_icons_555555_256x240_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./images/ui-icons_555555_256x240.png */ "./node_modules/jquery-ui/themes/base/images/ui-icons_555555_256x240.png");
/* harmony import */ var _images_ui_icons_ffffff_256x240_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./images/ui-icons_ffffff_256x240.png */ "./node_modules/jquery-ui/themes/base/images/ui-icons_ffffff_256x240.png");
/* harmony import */ var _images_ui_icons_777620_256x240_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./images/ui-icons_777620_256x240.png */ "./node_modules/jquery-ui/themes/base/images/ui-icons_777620_256x240.png");
/* harmony import */ var _images_ui_icons_cc0000_256x240_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./images/ui-icons_cc0000_256x240.png */ "./node_modules/jquery-ui/themes/base/images/ui-icons_cc0000_256x240.png");
/* harmony import */ var _images_ui_icons_777777_256x240_png__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./images/ui-icons_777777_256x240.png */ "./node_modules/jquery-ui/themes/base/images/ui-icons_777777_256x240.png");
// Imports








var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_images_ui_icons_444444_256x240_png__WEBPACK_IMPORTED_MODULE_2__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_images_ui_icons_555555_256x240_png__WEBPACK_IMPORTED_MODULE_3__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_images_ui_icons_ffffff_256x240_png__WEBPACK_IMPORTED_MODULE_4__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_images_ui_icons_777620_256x240_png__WEBPACK_IMPORTED_MODULE_5__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_4___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_images_ui_icons_cc0000_256x240_png__WEBPACK_IMPORTED_MODULE_6__["default"]);
var ___CSS_LOADER_URL_REPLACEMENT_5___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_1___default()(_images_ui_icons_777777_256x240_png__WEBPACK_IMPORTED_MODULE_7__["default"]);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "/*!\n * jQuery UI CSS Framework 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/category/theming/\n *\n * To view and modify this theme, visit http://jqueryui.com/themeroller/\n */\n\n\n/* Component containers\n----------------------------------*/\n.ui-widget {\n\tfont-family: Arial,Helvetica,sans-serif/*{ffDefault}*/;\n\tfont-size: 1em/*{fsDefault}*/;\n}\n.ui-widget .ui-widget {\n\tfont-size: 1em;\n}\n.ui-widget input,\n.ui-widget select,\n.ui-widget textarea,\n.ui-widget button {\n\tfont-family: Arial,Helvetica,sans-serif/*{ffDefault}*/;\n\tfont-size: 1em;\n}\n.ui-widget.ui-widget-content {\n\tborder: 1px solid #c5c5c5/*{borderColorDefault}*/;\n}\n.ui-widget-content {\n\tborder: 1px solid #dddddd/*{borderColorContent}*/;\n\tbackground: #ffffff/*{bgColorContent}*/ /*{bgImgUrlContent}*/ /*{bgContentXPos}*/ /*{bgContentYPos}*/ /*{bgContentRepeat}*/;\n\tcolor: #333333/*{fcContent}*/;\n}\n.ui-widget-content a {\n\tcolor: #333333/*{fcContent}*/;\n}\n.ui-widget-header {\n\tborder: 1px solid #dddddd/*{borderColorHeader}*/;\n\tbackground: #e9e9e9/*{bgColorHeader}*/ /*{bgImgUrlHeader}*/ /*{bgHeaderXPos}*/ /*{bgHeaderYPos}*/ /*{bgHeaderRepeat}*/;\n\tcolor: #333333/*{fcHeader}*/;\n\tfont-weight: bold;\n}\n.ui-widget-header a {\n\tcolor: #333333/*{fcHeader}*/;\n}\n\n/* Interaction states\n----------------------------------*/\n.ui-state-default,\n.ui-widget-content .ui-state-default,\n.ui-widget-header .ui-state-default,\n.ui-button,\n\n/* We use html here because we need a greater specificity to make sure disabled\nworks properly when clicked or hovered */\nhtml .ui-button.ui-state-disabled:hover,\nhtml .ui-button.ui-state-disabled:active {\n\tborder: 1px solid #c5c5c5/*{borderColorDefault}*/;\n\tbackground: #f6f6f6/*{bgColorDefault}*/ /*{bgImgUrlDefault}*/ /*{bgDefaultXPos}*/ /*{bgDefaultYPos}*/ /*{bgDefaultRepeat}*/;\n\tfont-weight: normal/*{fwDefault}*/;\n\tcolor: #454545/*{fcDefault}*/;\n}\n.ui-state-default a,\n.ui-state-default a:link,\n.ui-state-default a:visited,\na.ui-button,\na:link.ui-button,\na:visited.ui-button,\n.ui-button {\n\tcolor: #454545/*{fcDefault}*/;\n\ttext-decoration: none;\n}\n.ui-state-hover,\n.ui-widget-content .ui-state-hover,\n.ui-widget-header .ui-state-hover,\n.ui-state-focus,\n.ui-widget-content .ui-state-focus,\n.ui-widget-header .ui-state-focus,\n.ui-button:hover,\n.ui-button:focus {\n\tborder: 1px solid #cccccc/*{borderColorHover}*/;\n\tbackground: #ededed/*{bgColorHover}*/ /*{bgImgUrlHover}*/ /*{bgHoverXPos}*/ /*{bgHoverYPos}*/ /*{bgHoverRepeat}*/;\n\tfont-weight: normal/*{fwDefault}*/;\n\tcolor: #2b2b2b/*{fcHover}*/;\n}\n.ui-state-hover a,\n.ui-state-hover a:hover,\n.ui-state-hover a:link,\n.ui-state-hover a:visited,\n.ui-state-focus a,\n.ui-state-focus a:hover,\n.ui-state-focus a:link,\n.ui-state-focus a:visited,\na.ui-button:hover,\na.ui-button:focus {\n\tcolor: #2b2b2b/*{fcHover}*/;\n\ttext-decoration: none;\n}\n\n.ui-visual-focus {\n\tbox-shadow: 0 0 3px 1px rgb(94, 158, 214);\n}\n.ui-state-active,\n.ui-widget-content .ui-state-active,\n.ui-widget-header .ui-state-active,\na.ui-button:active,\n.ui-button:active,\n.ui-button.ui-state-active:hover {\n\tborder: 1px solid #003eff/*{borderColorActive}*/;\n\tbackground: #007fff/*{bgColorActive}*/ /*{bgImgUrlActive}*/ /*{bgActiveXPos}*/ /*{bgActiveYPos}*/ /*{bgActiveRepeat}*/;\n\tfont-weight: normal/*{fwDefault}*/;\n\tcolor: #ffffff/*{fcActive}*/;\n}\n.ui-icon-background,\n.ui-state-active .ui-icon-background {\n\tborder: #003eff/*{borderColorActive}*/;\n\tbackground-color: #ffffff/*{fcActive}*/;\n}\n.ui-state-active a,\n.ui-state-active a:link,\n.ui-state-active a:visited {\n\tcolor: #ffffff/*{fcActive}*/;\n\ttext-decoration: none;\n}\n\n/* Interaction Cues\n----------------------------------*/\n.ui-state-highlight,\n.ui-widget-content .ui-state-highlight,\n.ui-widget-header .ui-state-highlight {\n\tborder: 1px solid #dad55e/*{borderColorHighlight}*/;\n\tbackground: #fffa90/*{bgColorHighlight}*/ /*{bgImgUrlHighlight}*/ /*{bgHighlightXPos}*/ /*{bgHighlightYPos}*/ /*{bgHighlightRepeat}*/;\n\tcolor: #777620/*{fcHighlight}*/;\n}\n.ui-state-checked {\n\tborder: 1px solid #dad55e/*{borderColorHighlight}*/;\n\tbackground: #fffa90/*{bgColorHighlight}*/;\n}\n.ui-state-highlight a,\n.ui-widget-content .ui-state-highlight a,\n.ui-widget-header .ui-state-highlight a {\n\tcolor: #777620/*{fcHighlight}*/;\n}\n.ui-state-error,\n.ui-widget-content .ui-state-error,\n.ui-widget-header .ui-state-error {\n\tborder: 1px solid #f1a899/*{borderColorError}*/;\n\tbackground: #fddfdf/*{bgColorError}*/ /*{bgImgUrlError}*/ /*{bgErrorXPos}*/ /*{bgErrorYPos}*/ /*{bgErrorRepeat}*/;\n\tcolor: #5f3f3f/*{fcError}*/;\n}\n.ui-state-error a,\n.ui-widget-content .ui-state-error a,\n.ui-widget-header .ui-state-error a {\n\tcolor: #5f3f3f/*{fcError}*/;\n}\n.ui-state-error-text,\n.ui-widget-content .ui-state-error-text,\n.ui-widget-header .ui-state-error-text {\n\tcolor: #5f3f3f/*{fcError}*/;\n}\n.ui-priority-primary,\n.ui-widget-content .ui-priority-primary,\n.ui-widget-header .ui-priority-primary {\n\tfont-weight: bold;\n}\n.ui-priority-secondary,\n.ui-widget-content .ui-priority-secondary,\n.ui-widget-header .ui-priority-secondary {\n\topacity: .7;\n\tfilter:Alpha(Opacity=70); /* support: IE8 */\n\tfont-weight: normal;\n}\n.ui-state-disabled,\n.ui-widget-content .ui-state-disabled,\n.ui-widget-header .ui-state-disabled {\n\topacity: .35;\n\tfilter:Alpha(Opacity=35); /* support: IE8 */\n\tbackground-image: none;\n}\n.ui-state-disabled .ui-icon {\n\tfilter:Alpha(Opacity=35); /* support: IE8 - See #6059 */\n}\n\n/* Icons\n----------------------------------*/\n\n/* states and images */\n.ui-icon {\n\twidth: 16px;\n\theight: 16px;\n}\n.ui-icon,\n.ui-widget-content .ui-icon {\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}\n.ui-widget-header .ui-icon {\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}\n.ui-state-hover .ui-icon,\n.ui-state-focus .ui-icon,\n.ui-button:hover .ui-icon,\n.ui-button:focus .ui-icon {\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\n}\n.ui-state-active .ui-icon,\n.ui-button:active .ui-icon {\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ");\n}\n.ui-state-highlight .ui-icon,\n.ui-button .ui-state-highlight.ui-icon {\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ");\n}\n.ui-state-error .ui-icon,\n.ui-state-error-text .ui-icon {\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_4___ + ");\n}\n.ui-button .ui-icon {\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_5___ + ");\n}\n\n/* positioning */\n.ui-icon-blank { background-position: 16px 16px; }\n.ui-icon-caret-1-n { background-position: 0 0; }\n.ui-icon-caret-1-ne { background-position: -16px 0; }\n.ui-icon-caret-1-e { background-position: -32px 0; }\n.ui-icon-caret-1-se { background-position: -48px 0; }\n.ui-icon-caret-1-s { background-position: -65px 0; }\n.ui-icon-caret-1-sw { background-position: -80px 0; }\n.ui-icon-caret-1-w { background-position: -96px 0; }\n.ui-icon-caret-1-nw { background-position: -112px 0; }\n.ui-icon-caret-2-n-s { background-position: -128px 0; }\n.ui-icon-caret-2-e-w { background-position: -144px 0; }\n.ui-icon-triangle-1-n { background-position: 0 -16px; }\n.ui-icon-triangle-1-ne { background-position: -16px -16px; }\n.ui-icon-triangle-1-e { background-position: -32px -16px; }\n.ui-icon-triangle-1-se { background-position: -48px -16px; }\n.ui-icon-triangle-1-s { background-position: -65px -16px; }\n.ui-icon-triangle-1-sw { background-position: -80px -16px; }\n.ui-icon-triangle-1-w { background-position: -96px -16px; }\n.ui-icon-triangle-1-nw { background-position: -112px -16px; }\n.ui-icon-triangle-2-n-s { background-position: -128px -16px; }\n.ui-icon-triangle-2-e-w { background-position: -144px -16px; }\n.ui-icon-arrow-1-n { background-position: 0 -32px; }\n.ui-icon-arrow-1-ne { background-position: -16px -32px; }\n.ui-icon-arrow-1-e { background-position: -32px -32px; }\n.ui-icon-arrow-1-se { background-position: -48px -32px; }\n.ui-icon-arrow-1-s { background-position: -65px -32px; }\n.ui-icon-arrow-1-sw { background-position: -80px -32px; }\n.ui-icon-arrow-1-w { background-position: -96px -32px; }\n.ui-icon-arrow-1-nw { background-position: -112px -32px; }\n.ui-icon-arrow-2-n-s { background-position: -128px -32px; }\n.ui-icon-arrow-2-ne-sw { background-position: -144px -32px; }\n.ui-icon-arrow-2-e-w { background-position: -160px -32px; }\n.ui-icon-arrow-2-se-nw { background-position: -176px -32px; }\n.ui-icon-arrowstop-1-n { background-position: -192px -32px; }\n.ui-icon-arrowstop-1-e { background-position: -208px -32px; }\n.ui-icon-arrowstop-1-s { background-position: -224px -32px; }\n.ui-icon-arrowstop-1-w { background-position: -240px -32px; }\n.ui-icon-arrowthick-1-n { background-position: 1px -48px; }\n.ui-icon-arrowthick-1-ne { background-position: -16px -48px; }\n.ui-icon-arrowthick-1-e { background-position: -32px -48px; }\n.ui-icon-arrowthick-1-se { background-position: -48px -48px; }\n.ui-icon-arrowthick-1-s { background-position: -64px -48px; }\n.ui-icon-arrowthick-1-sw { background-position: -80px -48px; }\n.ui-icon-arrowthick-1-w { background-position: -96px -48px; }\n.ui-icon-arrowthick-1-nw { background-position: -112px -48px; }\n.ui-icon-arrowthick-2-n-s { background-position: -128px -48px; }\n.ui-icon-arrowthick-2-ne-sw { background-position: -144px -48px; }\n.ui-icon-arrowthick-2-e-w { background-position: -160px -48px; }\n.ui-icon-arrowthick-2-se-nw { background-position: -176px -48px; }\n.ui-icon-arrowthickstop-1-n { background-position: -192px -48px; }\n.ui-icon-arrowthickstop-1-e { background-position: -208px -48px; }\n.ui-icon-arrowthickstop-1-s { background-position: -224px -48px; }\n.ui-icon-arrowthickstop-1-w { background-position: -240px -48px; }\n.ui-icon-arrowreturnthick-1-w { background-position: 0 -64px; }\n.ui-icon-arrowreturnthick-1-n { background-position: -16px -64px; }\n.ui-icon-arrowreturnthick-1-e { background-position: -32px -64px; }\n.ui-icon-arrowreturnthick-1-s { background-position: -48px -64px; }\n.ui-icon-arrowreturn-1-w { background-position: -64px -64px; }\n.ui-icon-arrowreturn-1-n { background-position: -80px -64px; }\n.ui-icon-arrowreturn-1-e { background-position: -96px -64px; }\n.ui-icon-arrowreturn-1-s { background-position: -112px -64px; }\n.ui-icon-arrowrefresh-1-w { background-position: -128px -64px; }\n.ui-icon-arrowrefresh-1-n { background-position: -144px -64px; }\n.ui-icon-arrowrefresh-1-e { background-position: -160px -64px; }\n.ui-icon-arrowrefresh-1-s { background-position: -176px -64px; }\n.ui-icon-arrow-4 { background-position: 0 -80px; }\n.ui-icon-arrow-4-diag { background-position: -16px -80px; }\n.ui-icon-extlink { background-position: -32px -80px; }\n.ui-icon-newwin { background-position: -48px -80px; }\n.ui-icon-refresh { background-position: -64px -80px; }\n.ui-icon-shuffle { background-position: -80px -80px; }\n.ui-icon-transfer-e-w { background-position: -96px -80px; }\n.ui-icon-transferthick-e-w { background-position: -112px -80px; }\n.ui-icon-folder-collapsed { background-position: 0 -96px; }\n.ui-icon-folder-open { background-position: -16px -96px; }\n.ui-icon-document { background-position: -32px -96px; }\n.ui-icon-document-b { background-position: -48px -96px; }\n.ui-icon-note { background-position: -64px -96px; }\n.ui-icon-mail-closed { background-position: -80px -96px; }\n.ui-icon-mail-open { background-position: -96px -96px; }\n.ui-icon-suitcase { background-position: -112px -96px; }\n.ui-icon-comment { background-position: -128px -96px; }\n.ui-icon-person { background-position: -144px -96px; }\n.ui-icon-print { background-position: -160px -96px; }\n.ui-icon-trash { background-position: -176px -96px; }\n.ui-icon-locked { background-position: -192px -96px; }\n.ui-icon-unlocked { background-position: -208px -96px; }\n.ui-icon-bookmark { background-position: -224px -96px; }\n.ui-icon-tag { background-position: -240px -96px; }\n.ui-icon-home { background-position: 0 -112px; }\n.ui-icon-flag { background-position: -16px -112px; }\n.ui-icon-calendar { background-position: -32px -112px; }\n.ui-icon-cart { background-position: -48px -112px; }\n.ui-icon-pencil { background-position: -64px -112px; }\n.ui-icon-clock { background-position: -80px -112px; }\n.ui-icon-disk { background-position: -96px -112px; }\n.ui-icon-calculator { background-position: -112px -112px; }\n.ui-icon-zoomin { background-position: -128px -112px; }\n.ui-icon-zoomout { background-position: -144px -112px; }\n.ui-icon-search { background-position: -160px -112px; }\n.ui-icon-wrench { background-position: -176px -112px; }\n.ui-icon-gear { background-position: -192px -112px; }\n.ui-icon-heart { background-position: -208px -112px; }\n.ui-icon-star { background-position: -224px -112px; }\n.ui-icon-link { background-position: -240px -112px; }\n.ui-icon-cancel { background-position: 0 -128px; }\n.ui-icon-plus { background-position: -16px -128px; }\n.ui-icon-plusthick { background-position: -32px -128px; }\n.ui-icon-minus { background-position: -48px -128px; }\n.ui-icon-minusthick { background-position: -64px -128px; }\n.ui-icon-close { background-position: -80px -128px; }\n.ui-icon-closethick { background-position: -96px -128px; }\n.ui-icon-key { background-position: -112px -128px; }\n.ui-icon-lightbulb { background-position: -128px -128px; }\n.ui-icon-scissors { background-position: -144px -128px; }\n.ui-icon-clipboard { background-position: -160px -128px; }\n.ui-icon-copy { background-position: -176px -128px; }\n.ui-icon-contact { background-position: -192px -128px; }\n.ui-icon-image { background-position: -208px -128px; }\n.ui-icon-video { background-position: -224px -128px; }\n.ui-icon-script { background-position: -240px -128px; }\n.ui-icon-alert { background-position: 0 -144px; }\n.ui-icon-info { background-position: -16px -144px; }\n.ui-icon-notice { background-position: -32px -144px; }\n.ui-icon-help { background-position: -48px -144px; }\n.ui-icon-check { background-position: -64px -144px; }\n.ui-icon-bullet { background-position: -80px -144px; }\n.ui-icon-radio-on { background-position: -96px -144px; }\n.ui-icon-radio-off { background-position: -112px -144px; }\n.ui-icon-pin-w { background-position: -128px -144px; }\n.ui-icon-pin-s { background-position: -144px -144px; }\n.ui-icon-play { background-position: 0 -160px; }\n.ui-icon-pause { background-position: -16px -160px; }\n.ui-icon-seek-next { background-position: -32px -160px; }\n.ui-icon-seek-prev { background-position: -48px -160px; }\n.ui-icon-seek-end { background-position: -64px -160px; }\n.ui-icon-seek-start { background-position: -80px -160px; }\n/* ui-icon-seek-first is deprecated, use ui-icon-seek-start instead */\n.ui-icon-seek-first { background-position: -80px -160px; }\n.ui-icon-stop { background-position: -96px -160px; }\n.ui-icon-eject { background-position: -112px -160px; }\n.ui-icon-volume-off { background-position: -128px -160px; }\n.ui-icon-volume-on { background-position: -144px -160px; }\n.ui-icon-power { background-position: 0 -176px; }\n.ui-icon-signal-diag { background-position: -16px -176px; }\n.ui-icon-signal { background-position: -32px -176px; }\n.ui-icon-battery-0 { background-position: -48px -176px; }\n.ui-icon-battery-1 { background-position: -64px -176px; }\n.ui-icon-battery-2 { background-position: -80px -176px; }\n.ui-icon-battery-3 { background-position: -96px -176px; }\n.ui-icon-circle-plus { background-position: 0 -192px; }\n.ui-icon-circle-minus { background-position: -16px -192px; }\n.ui-icon-circle-close { background-position: -32px -192px; }\n.ui-icon-circle-triangle-e { background-position: -48px -192px; }\n.ui-icon-circle-triangle-s { background-position: -64px -192px; }\n.ui-icon-circle-triangle-w { background-position: -80px -192px; }\n.ui-icon-circle-triangle-n { background-position: -96px -192px; }\n.ui-icon-circle-arrow-e { background-position: -112px -192px; }\n.ui-icon-circle-arrow-s { background-position: -128px -192px; }\n.ui-icon-circle-arrow-w { background-position: -144px -192px; }\n.ui-icon-circle-arrow-n { background-position: -160px -192px; }\n.ui-icon-circle-zoomin { background-position: -176px -192px; }\n.ui-icon-circle-zoomout { background-position: -192px -192px; }\n.ui-icon-circle-check { background-position: -208px -192px; }\n.ui-icon-circlesmall-plus { background-position: 0 -208px; }\n.ui-icon-circlesmall-minus { background-position: -16px -208px; }\n.ui-icon-circlesmall-close { background-position: -32px -208px; }\n.ui-icon-squaresmall-plus { background-position: -48px -208px; }\n.ui-icon-squaresmall-minus { background-position: -64px -208px; }\n.ui-icon-squaresmall-close { background-position: -80px -208px; }\n.ui-icon-grip-dotted-vertical { background-position: 0 -224px; }\n.ui-icon-grip-dotted-horizontal { background-position: -16px -224px; }\n.ui-icon-grip-solid-vertical { background-position: -32px -224px; }\n.ui-icon-grip-solid-horizontal { background-position: -48px -224px; }\n.ui-icon-gripsmall-diagonal-se { background-position: -64px -224px; }\n.ui-icon-grip-diagonal-se { background-position: -80px -224px; }\n\n\n/* Misc visuals\n----------------------------------*/\n\n/* Corner radius */\n.ui-corner-all,\n.ui-corner-top,\n.ui-corner-left,\n.ui-corner-tl {\n\tborder-top-left-radius: 3px/*{cornerRadius}*/;\n}\n.ui-corner-all,\n.ui-corner-top,\n.ui-corner-right,\n.ui-corner-tr {\n\tborder-top-right-radius: 3px/*{cornerRadius}*/;\n}\n.ui-corner-all,\n.ui-corner-bottom,\n.ui-corner-left,\n.ui-corner-bl {\n\tborder-bottom-left-radius: 3px/*{cornerRadius}*/;\n}\n.ui-corner-all,\n.ui-corner-bottom,\n.ui-corner-right,\n.ui-corner-br {\n\tborder-bottom-right-radius: 3px/*{cornerRadius}*/;\n}\n\n/* Overlays */\n.ui-widget-overlay {\n\tbackground: #aaaaaa/*{bgColorOverlay}*/ /*{bgImgUrlOverlay}*/ /*{bgOverlayXPos}*/ /*{bgOverlayYPos}*/ /*{bgOverlayRepeat}*/;\n\topacity: .3/*{opacityOverlay}*/;\n\tfilter: Alpha(Opacity=30)/*{opacityFilterOverlay}*/; /* support: IE8 */\n}\n.ui-widget-shadow {\n\t-webkit-box-shadow: 0/*{offsetLeftShadow}*/ 0/*{offsetTopShadow}*/ 5px/*{thicknessShadow}*/ #666666/*{bgColorShadow}*/;\n\tbox-shadow: 0/*{offsetLeftShadow}*/ 0/*{offsetTopShadow}*/ 5px/*{thicknessShadow}*/ #666666/*{bgColorShadow}*/;\n}\n", "",{"version":3,"sources":["webpack://node_modules/jquery-ui/themes/base/theme.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;EAWE;;;AAGF;mCACmC;AACnC;CACC,sDAAsD;CACtD,6BAA6B;AAC9B;AACA;CACC,cAAc;AACf;AACA;;;;CAIC,sDAAsD;CACtD,cAAc;AACf;AACA;CACC,iDAAiD;AAClD;AACA;CACC,iDAAiD;CACjD,2HAA2H;CAC3H,6BAA6B;AAC9B;AACA;CACC,6BAA6B;AAC9B;AACA;CACC,gDAAgD;CAChD,sHAAsH;CACtH,4BAA4B;CAC5B,iBAAiB;AAClB;AACA;CACC,4BAA4B;AAC7B;;AAEA;mCACmC;AACnC;;;;;;;;;CASC,iDAAiD;CACjD,2HAA2H;CAC3H,kCAAkC;CAClC,6BAA6B;AAC9B;AACA;;;;;;;CAOC,6BAA6B;CAC7B,qBAAqB;AACtB;AACA;;;;;;;;CAQC,+CAA+C;CAC/C,iHAAiH;CACjH,kCAAkC;CAClC,2BAA2B;AAC5B;AACA;;;;;;;;;;CAUC,2BAA2B;CAC3B,qBAAqB;AACtB;;AAEA;CACC,yCAAyC;AAC1C;AACA;;;;;;CAMC,gDAAgD;CAChD,sHAAsH;CACtH,kCAAkC;CAClC,4BAA4B;AAC7B;AACA;;CAEC,sCAAsC;CACtC,uCAAuC;AACxC;AACA;;;CAGC,4BAA4B;CAC5B,qBAAqB;AACtB;;AAEA;mCACmC;AACnC;;;CAGC,mDAAmD;CACnD,qIAAqI;CACrI,+BAA+B;AAChC;AACA;CACC,mDAAmD;CACnD,yCAAyC;AAC1C;AACA;;;CAGC,+BAA+B;AAChC;AACA;;;CAGC,+CAA+C;CAC/C,iHAAiH;CACjH,2BAA2B;AAC5B;AACA;;;CAGC,2BAA2B;AAC5B;AACA;;;CAGC,2BAA2B;AAC5B;AACA;;;CAGC,iBAAiB;AAClB;AACA;;;CAGC,WAAW;CACX,wBAAwB,EAAE,iBAAiB;CAC3C,mBAAmB;AACpB;AACA;;;CAGC,YAAY;CACZ,wBAAwB,EAAE,iBAAiB;CAC3C,sBAAsB;AACvB;AACA;CACC,wBAAwB,EAAE,6BAA6B;AACxD;;AAEA;mCACmC;;AAEnC,sBAAsB;AACtB;CACC,WAAW;CACX,YAAY;AACb;AACA;;CAEC,yDAA6E;AAC9E;AACA;CACC,yDAA4E;AAC7E;AACA;;;;CAIC,yDAA2E;AAC5E;AACA;;CAEC,yDAA4E;AAC7E;AACA;;CAEC,yDAA+E;AAChF;AACA;;CAEC,yDAA2E;AAC5E;AACA;CACC,yDAA6E;AAC9E;;AAEA,gBAAgB;AAChB,iBAAiB,8BAA8B,EAAE;AACjD,qBAAqB,wBAAwB,EAAE;AAC/C,sBAAsB,4BAA4B,EAAE;AACpD,qBAAqB,4BAA4B,EAAE;AACnD,sBAAsB,4BAA4B,EAAE;AACpD,qBAAqB,4BAA4B,EAAE;AACnD,sBAAsB,4BAA4B,EAAE;AACpD,qBAAqB,4BAA4B,EAAE;AACnD,sBAAsB,6BAA6B,EAAE;AACrD,uBAAuB,6BAA6B,EAAE;AACtD,uBAAuB,6BAA6B,EAAE;AACtD,wBAAwB,4BAA4B,EAAE;AACtD,yBAAyB,gCAAgC,EAAE;AAC3D,wBAAwB,gCAAgC,EAAE;AAC1D,yBAAyB,gCAAgC,EAAE;AAC3D,wBAAwB,gCAAgC,EAAE;AAC1D,yBAAyB,gCAAgC,EAAE;AAC3D,wBAAwB,gCAAgC,EAAE;AAC1D,yBAAyB,iCAAiC,EAAE;AAC5D,0BAA0B,iCAAiC,EAAE;AAC7D,0BAA0B,iCAAiC,EAAE;AAC7D,qBAAqB,4BAA4B,EAAE;AACnD,sBAAsB,gCAAgC,EAAE;AACxD,qBAAqB,gCAAgC,EAAE;AACvD,sBAAsB,gCAAgC,EAAE;AACxD,qBAAqB,gCAAgC,EAAE;AACvD,sBAAsB,gCAAgC,EAAE;AACxD,qBAAqB,gCAAgC,EAAE;AACvD,sBAAsB,iCAAiC,EAAE;AACzD,uBAAuB,iCAAiC,EAAE;AAC1D,yBAAyB,iCAAiC,EAAE;AAC5D,uBAAuB,iCAAiC,EAAE;AAC1D,yBAAyB,iCAAiC,EAAE;AAC5D,yBAAyB,iCAAiC,EAAE;AAC5D,yBAAyB,iCAAiC,EAAE;AAC5D,yBAAyB,iCAAiC,EAAE;AAC5D,yBAAyB,iCAAiC,EAAE;AAC5D,0BAA0B,8BAA8B,EAAE;AAC1D,2BAA2B,gCAAgC,EAAE;AAC7D,0BAA0B,gCAAgC,EAAE;AAC5D,2BAA2B,gCAAgC,EAAE;AAC7D,0BAA0B,gCAAgC,EAAE;AAC5D,2BAA2B,gCAAgC,EAAE;AAC7D,0BAA0B,gCAAgC,EAAE;AAC5D,2BAA2B,iCAAiC,EAAE;AAC9D,4BAA4B,iCAAiC,EAAE;AAC/D,8BAA8B,iCAAiC,EAAE;AACjE,4BAA4B,iCAAiC,EAAE;AAC/D,8BAA8B,iCAAiC,EAAE;AACjE,8BAA8B,iCAAiC,EAAE;AACjE,8BAA8B,iCAAiC,EAAE;AACjE,8BAA8B,iCAAiC,EAAE;AACjE,8BAA8B,iCAAiC,EAAE;AACjE,gCAAgC,4BAA4B,EAAE;AAC9D,gCAAgC,gCAAgC,EAAE;AAClE,gCAAgC,gCAAgC,EAAE;AAClE,gCAAgC,gCAAgC,EAAE;AAClE,2BAA2B,gCAAgC,EAAE;AAC7D,2BAA2B,gCAAgC,EAAE;AAC7D,2BAA2B,gCAAgC,EAAE;AAC7D,2BAA2B,iCAAiC,EAAE;AAC9D,4BAA4B,iCAAiC,EAAE;AAC/D,4BAA4B,iCAAiC,EAAE;AAC/D,4BAA4B,iCAAiC,EAAE;AAC/D,4BAA4B,iCAAiC,EAAE;AAC/D,mBAAmB,4BAA4B,EAAE;AACjD,wBAAwB,gCAAgC,EAAE;AAC1D,mBAAmB,gCAAgC,EAAE;AACrD,kBAAkB,gCAAgC,EAAE;AACpD,mBAAmB,gCAAgC,EAAE;AACrD,mBAAmB,gCAAgC,EAAE;AACrD,wBAAwB,gCAAgC,EAAE;AAC1D,6BAA6B,iCAAiC,EAAE;AAChE,4BAA4B,4BAA4B,EAAE;AAC1D,uBAAuB,gCAAgC,EAAE;AACzD,oBAAoB,gCAAgC,EAAE;AACtD,sBAAsB,gCAAgC,EAAE;AACxD,gBAAgB,gCAAgC,EAAE;AAClD,uBAAuB,gCAAgC,EAAE;AACzD,qBAAqB,gCAAgC,EAAE;AACvD,oBAAoB,iCAAiC,EAAE;AACvD,mBAAmB,iCAAiC,EAAE;AACtD,kBAAkB,iCAAiC,EAAE;AACrD,iBAAiB,iCAAiC,EAAE;AACpD,iBAAiB,iCAAiC,EAAE;AACpD,kBAAkB,iCAAiC,EAAE;AACrD,oBAAoB,iCAAiC,EAAE;AACvD,oBAAoB,iCAAiC,EAAE;AACvD,eAAe,iCAAiC,EAAE;AAClD,gBAAgB,6BAA6B,EAAE;AAC/C,gBAAgB,iCAAiC,EAAE;AACnD,oBAAoB,iCAAiC,EAAE;AACvD,gBAAgB,iCAAiC,EAAE;AACnD,kBAAkB,iCAAiC,EAAE;AACrD,iBAAiB,iCAAiC,EAAE;AACpD,gBAAgB,iCAAiC,EAAE;AACnD,sBAAsB,kCAAkC,EAAE;AAC1D,kBAAkB,kCAAkC,EAAE;AACtD,mBAAmB,kCAAkC,EAAE;AACvD,kBAAkB,kCAAkC,EAAE;AACtD,kBAAkB,kCAAkC,EAAE;AACtD,gBAAgB,kCAAkC,EAAE;AACpD,iBAAiB,kCAAkC,EAAE;AACrD,gBAAgB,kCAAkC,EAAE;AACpD,gBAAgB,kCAAkC,EAAE;AACpD,kBAAkB,6BAA6B,EAAE;AACjD,gBAAgB,iCAAiC,EAAE;AACnD,qBAAqB,iCAAiC,EAAE;AACxD,iBAAiB,iCAAiC,EAAE;AACpD,sBAAsB,iCAAiC,EAAE;AACzD,iBAAiB,iCAAiC,EAAE;AACpD,sBAAsB,iCAAiC,EAAE;AACzD,eAAe,kCAAkC,EAAE;AACnD,qBAAqB,kCAAkC,EAAE;AACzD,oBAAoB,kCAAkC,EAAE;AACxD,qBAAqB,kCAAkC,EAAE;AACzD,gBAAgB,kCAAkC,EAAE;AACpD,mBAAmB,kCAAkC,EAAE;AACvD,iBAAiB,kCAAkC,EAAE;AACrD,iBAAiB,kCAAkC,EAAE;AACrD,kBAAkB,kCAAkC,EAAE;AACtD,iBAAiB,6BAA6B,EAAE;AAChD,gBAAgB,iCAAiC,EAAE;AACnD,kBAAkB,iCAAiC,EAAE;AACrD,gBAAgB,iCAAiC,EAAE;AACnD,iBAAiB,iCAAiC,EAAE;AACpD,kBAAkB,iCAAiC,EAAE;AACrD,oBAAoB,iCAAiC,EAAE;AACvD,qBAAqB,kCAAkC,EAAE;AACzD,iBAAiB,kCAAkC,EAAE;AACrD,iBAAiB,kCAAkC,EAAE;AACrD,gBAAgB,6BAA6B,EAAE;AAC/C,iBAAiB,iCAAiC,EAAE;AACpD,qBAAqB,iCAAiC,EAAE;AACxD,qBAAqB,iCAAiC,EAAE;AACxD,oBAAoB,iCAAiC,EAAE;AACvD,sBAAsB,iCAAiC,EAAE;AACzD,qEAAqE;AACrE,sBAAsB,iCAAiC,EAAE;AACzD,gBAAgB,iCAAiC,EAAE;AACnD,iBAAiB,kCAAkC,EAAE;AACrD,sBAAsB,kCAAkC,EAAE;AAC1D,qBAAqB,kCAAkC,EAAE;AACzD,iBAAiB,6BAA6B,EAAE;AAChD,uBAAuB,iCAAiC,EAAE;AAC1D,kBAAkB,iCAAiC,EAAE;AACrD,qBAAqB,iCAAiC,EAAE;AACxD,qBAAqB,iCAAiC,EAAE;AACxD,qBAAqB,iCAAiC,EAAE;AACxD,qBAAqB,iCAAiC,EAAE;AACxD,uBAAuB,6BAA6B,EAAE;AACtD,wBAAwB,iCAAiC,EAAE;AAC3D,wBAAwB,iCAAiC,EAAE;AAC3D,6BAA6B,iCAAiC,EAAE;AAChE,6BAA6B,iCAAiC,EAAE;AAChE,6BAA6B,iCAAiC,EAAE;AAChE,6BAA6B,iCAAiC,EAAE;AAChE,0BAA0B,kCAAkC,EAAE;AAC9D,0BAA0B,kCAAkC,EAAE;AAC9D,0BAA0B,kCAAkC,EAAE;AAC9D,0BAA0B,kCAAkC,EAAE;AAC9D,yBAAyB,kCAAkC,EAAE;AAC7D,0BAA0B,kCAAkC,EAAE;AAC9D,wBAAwB,kCAAkC,EAAE;AAC5D,4BAA4B,6BAA6B,EAAE;AAC3D,6BAA6B,iCAAiC,EAAE;AAChE,6BAA6B,iCAAiC,EAAE;AAChE,4BAA4B,iCAAiC,EAAE;AAC/D,6BAA6B,iCAAiC,EAAE;AAChE,6BAA6B,iCAAiC,EAAE;AAChE,gCAAgC,6BAA6B,EAAE;AAC/D,kCAAkC,iCAAiC,EAAE;AACrE,+BAA+B,iCAAiC,EAAE;AAClE,iCAAiC,iCAAiC,EAAE;AACpE,iCAAiC,iCAAiC,EAAE;AACpE,4BAA4B,iCAAiC,EAAE;;;AAG/D;mCACmC;;AAEnC,kBAAkB;AAClB;;;;CAIC,6CAA6C;AAC9C;AACA;;;;CAIC,8CAA8C;AAC/C;AACA;;;;CAIC,gDAAgD;AACjD;AACA;;;;CAIC,iDAAiD;AAClD;;AAEA,aAAa;AACb;CACC,2HAA2H;CAC3H,+BAA+B;CAC/B,mDAAmD,EAAE,iBAAiB;AACvE;AACA;CACC,sHAAsH;CACtH,8GAA8G;AAC/G","sourcesContent":["/*!\n * jQuery UI CSS Framework 1.12.1\n * http://jqueryui.com\n *\n * Copyright jQuery Foundation and other contributors\n * Released under the MIT license.\n * http://jquery.org/license\n *\n * http://api.jqueryui.com/category/theming/\n *\n * To view and modify this theme, visit http://jqueryui.com/themeroller/\n */\n\n\n/* Component containers\n----------------------------------*/\n.ui-widget {\n\tfont-family: Arial,Helvetica,sans-serif/*{ffDefault}*/;\n\tfont-size: 1em/*{fsDefault}*/;\n}\n.ui-widget .ui-widget {\n\tfont-size: 1em;\n}\n.ui-widget input,\n.ui-widget select,\n.ui-widget textarea,\n.ui-widget button {\n\tfont-family: Arial,Helvetica,sans-serif/*{ffDefault}*/;\n\tfont-size: 1em;\n}\n.ui-widget.ui-widget-content {\n\tborder: 1px solid #c5c5c5/*{borderColorDefault}*/;\n}\n.ui-widget-content {\n\tborder: 1px solid #dddddd/*{borderColorContent}*/;\n\tbackground: #ffffff/*{bgColorContent}*/ /*{bgImgUrlContent}*/ /*{bgContentXPos}*/ /*{bgContentYPos}*/ /*{bgContentRepeat}*/;\n\tcolor: #333333/*{fcContent}*/;\n}\n.ui-widget-content a {\n\tcolor: #333333/*{fcContent}*/;\n}\n.ui-widget-header {\n\tborder: 1px solid #dddddd/*{borderColorHeader}*/;\n\tbackground: #e9e9e9/*{bgColorHeader}*/ /*{bgImgUrlHeader}*/ /*{bgHeaderXPos}*/ /*{bgHeaderYPos}*/ /*{bgHeaderRepeat}*/;\n\tcolor: #333333/*{fcHeader}*/;\n\tfont-weight: bold;\n}\n.ui-widget-header a {\n\tcolor: #333333/*{fcHeader}*/;\n}\n\n/* Interaction states\n----------------------------------*/\n.ui-state-default,\n.ui-widget-content .ui-state-default,\n.ui-widget-header .ui-state-default,\n.ui-button,\n\n/* We use html here because we need a greater specificity to make sure disabled\nworks properly when clicked or hovered */\nhtml .ui-button.ui-state-disabled:hover,\nhtml .ui-button.ui-state-disabled:active {\n\tborder: 1px solid #c5c5c5/*{borderColorDefault}*/;\n\tbackground: #f6f6f6/*{bgColorDefault}*/ /*{bgImgUrlDefault}*/ /*{bgDefaultXPos}*/ /*{bgDefaultYPos}*/ /*{bgDefaultRepeat}*/;\n\tfont-weight: normal/*{fwDefault}*/;\n\tcolor: #454545/*{fcDefault}*/;\n}\n.ui-state-default a,\n.ui-state-default a:link,\n.ui-state-default a:visited,\na.ui-button,\na:link.ui-button,\na:visited.ui-button,\n.ui-button {\n\tcolor: #454545/*{fcDefault}*/;\n\ttext-decoration: none;\n}\n.ui-state-hover,\n.ui-widget-content .ui-state-hover,\n.ui-widget-header .ui-state-hover,\n.ui-state-focus,\n.ui-widget-content .ui-state-focus,\n.ui-widget-header .ui-state-focus,\n.ui-button:hover,\n.ui-button:focus {\n\tborder: 1px solid #cccccc/*{borderColorHover}*/;\n\tbackground: #ededed/*{bgColorHover}*/ /*{bgImgUrlHover}*/ /*{bgHoverXPos}*/ /*{bgHoverYPos}*/ /*{bgHoverRepeat}*/;\n\tfont-weight: normal/*{fwDefault}*/;\n\tcolor: #2b2b2b/*{fcHover}*/;\n}\n.ui-state-hover a,\n.ui-state-hover a:hover,\n.ui-state-hover a:link,\n.ui-state-hover a:visited,\n.ui-state-focus a,\n.ui-state-focus a:hover,\n.ui-state-focus a:link,\n.ui-state-focus a:visited,\na.ui-button:hover,\na.ui-button:focus {\n\tcolor: #2b2b2b/*{fcHover}*/;\n\ttext-decoration: none;\n}\n\n.ui-visual-focus {\n\tbox-shadow: 0 0 3px 1px rgb(94, 158, 214);\n}\n.ui-state-active,\n.ui-widget-content .ui-state-active,\n.ui-widget-header .ui-state-active,\na.ui-button:active,\n.ui-button:active,\n.ui-button.ui-state-active:hover {\n\tborder: 1px solid #003eff/*{borderColorActive}*/;\n\tbackground: #007fff/*{bgColorActive}*/ /*{bgImgUrlActive}*/ /*{bgActiveXPos}*/ /*{bgActiveYPos}*/ /*{bgActiveRepeat}*/;\n\tfont-weight: normal/*{fwDefault}*/;\n\tcolor: #ffffff/*{fcActive}*/;\n}\n.ui-icon-background,\n.ui-state-active .ui-icon-background {\n\tborder: #003eff/*{borderColorActive}*/;\n\tbackground-color: #ffffff/*{fcActive}*/;\n}\n.ui-state-active a,\n.ui-state-active a:link,\n.ui-state-active a:visited {\n\tcolor: #ffffff/*{fcActive}*/;\n\ttext-decoration: none;\n}\n\n/* Interaction Cues\n----------------------------------*/\n.ui-state-highlight,\n.ui-widget-content .ui-state-highlight,\n.ui-widget-header .ui-state-highlight {\n\tborder: 1px solid #dad55e/*{borderColorHighlight}*/;\n\tbackground: #fffa90/*{bgColorHighlight}*/ /*{bgImgUrlHighlight}*/ /*{bgHighlightXPos}*/ /*{bgHighlightYPos}*/ /*{bgHighlightRepeat}*/;\n\tcolor: #777620/*{fcHighlight}*/;\n}\n.ui-state-checked {\n\tborder: 1px solid #dad55e/*{borderColorHighlight}*/;\n\tbackground: #fffa90/*{bgColorHighlight}*/;\n}\n.ui-state-highlight a,\n.ui-widget-content .ui-state-highlight a,\n.ui-widget-header .ui-state-highlight a {\n\tcolor: #777620/*{fcHighlight}*/;\n}\n.ui-state-error,\n.ui-widget-content .ui-state-error,\n.ui-widget-header .ui-state-error {\n\tborder: 1px solid #f1a899/*{borderColorError}*/;\n\tbackground: #fddfdf/*{bgColorError}*/ /*{bgImgUrlError}*/ /*{bgErrorXPos}*/ /*{bgErrorYPos}*/ /*{bgErrorRepeat}*/;\n\tcolor: #5f3f3f/*{fcError}*/;\n}\n.ui-state-error a,\n.ui-widget-content .ui-state-error a,\n.ui-widget-header .ui-state-error a {\n\tcolor: #5f3f3f/*{fcError}*/;\n}\n.ui-state-error-text,\n.ui-widget-content .ui-state-error-text,\n.ui-widget-header .ui-state-error-text {\n\tcolor: #5f3f3f/*{fcError}*/;\n}\n.ui-priority-primary,\n.ui-widget-content .ui-priority-primary,\n.ui-widget-header .ui-priority-primary {\n\tfont-weight: bold;\n}\n.ui-priority-secondary,\n.ui-widget-content .ui-priority-secondary,\n.ui-widget-header .ui-priority-secondary {\n\topacity: .7;\n\tfilter:Alpha(Opacity=70); /* support: IE8 */\n\tfont-weight: normal;\n}\n.ui-state-disabled,\n.ui-widget-content .ui-state-disabled,\n.ui-widget-header .ui-state-disabled {\n\topacity: .35;\n\tfilter:Alpha(Opacity=35); /* support: IE8 */\n\tbackground-image: none;\n}\n.ui-state-disabled .ui-icon {\n\tfilter:Alpha(Opacity=35); /* support: IE8 - See #6059 */\n}\n\n/* Icons\n----------------------------------*/\n\n/* states and images */\n.ui-icon {\n\twidth: 16px;\n\theight: 16px;\n}\n.ui-icon,\n.ui-widget-content .ui-icon {\n\tbackground-image: url(\"images/ui-icons_444444_256x240.png\")/*{iconsContent}*/;\n}\n.ui-widget-header .ui-icon {\n\tbackground-image: url(\"images/ui-icons_444444_256x240.png\")/*{iconsHeader}*/;\n}\n.ui-state-hover .ui-icon,\n.ui-state-focus .ui-icon,\n.ui-button:hover .ui-icon,\n.ui-button:focus .ui-icon {\n\tbackground-image: url(\"images/ui-icons_555555_256x240.png\")/*{iconsHover}*/;\n}\n.ui-state-active .ui-icon,\n.ui-button:active .ui-icon {\n\tbackground-image: url(\"images/ui-icons_ffffff_256x240.png\")/*{iconsActive}*/;\n}\n.ui-state-highlight .ui-icon,\n.ui-button .ui-state-highlight.ui-icon {\n\tbackground-image: url(\"images/ui-icons_777620_256x240.png\")/*{iconsHighlight}*/;\n}\n.ui-state-error .ui-icon,\n.ui-state-error-text .ui-icon {\n\tbackground-image: url(\"images/ui-icons_cc0000_256x240.png\")/*{iconsError}*/;\n}\n.ui-button .ui-icon {\n\tbackground-image: url(\"images/ui-icons_777777_256x240.png\")/*{iconsDefault}*/;\n}\n\n/* positioning */\n.ui-icon-blank { background-position: 16px 16px; }\n.ui-icon-caret-1-n { background-position: 0 0; }\n.ui-icon-caret-1-ne { background-position: -16px 0; }\n.ui-icon-caret-1-e { background-position: -32px 0; }\n.ui-icon-caret-1-se { background-position: -48px 0; }\n.ui-icon-caret-1-s { background-position: -65px 0; }\n.ui-icon-caret-1-sw { background-position: -80px 0; }\n.ui-icon-caret-1-w { background-position: -96px 0; }\n.ui-icon-caret-1-nw { background-position: -112px 0; }\n.ui-icon-caret-2-n-s { background-position: -128px 0; }\n.ui-icon-caret-2-e-w { background-position: -144px 0; }\n.ui-icon-triangle-1-n { background-position: 0 -16px; }\n.ui-icon-triangle-1-ne { background-position: -16px -16px; }\n.ui-icon-triangle-1-e { background-position: -32px -16px; }\n.ui-icon-triangle-1-se { background-position: -48px -16px; }\n.ui-icon-triangle-1-s { background-position: -65px -16px; }\n.ui-icon-triangle-1-sw { background-position: -80px -16px; }\n.ui-icon-triangle-1-w { background-position: -96px -16px; }\n.ui-icon-triangle-1-nw { background-position: -112px -16px; }\n.ui-icon-triangle-2-n-s { background-position: -128px -16px; }\n.ui-icon-triangle-2-e-w { background-position: -144px -16px; }\n.ui-icon-arrow-1-n { background-position: 0 -32px; }\n.ui-icon-arrow-1-ne { background-position: -16px -32px; }\n.ui-icon-arrow-1-e { background-position: -32px -32px; }\n.ui-icon-arrow-1-se { background-position: -48px -32px; }\n.ui-icon-arrow-1-s { background-position: -65px -32px; }\n.ui-icon-arrow-1-sw { background-position: -80px -32px; }\n.ui-icon-arrow-1-w { background-position: -96px -32px; }\n.ui-icon-arrow-1-nw { background-position: -112px -32px; }\n.ui-icon-arrow-2-n-s { background-position: -128px -32px; }\n.ui-icon-arrow-2-ne-sw { background-position: -144px -32px; }\n.ui-icon-arrow-2-e-w { background-position: -160px -32px; }\n.ui-icon-arrow-2-se-nw { background-position: -176px -32px; }\n.ui-icon-arrowstop-1-n { background-position: -192px -32px; }\n.ui-icon-arrowstop-1-e { background-position: -208px -32px; }\n.ui-icon-arrowstop-1-s { background-position: -224px -32px; }\n.ui-icon-arrowstop-1-w { background-position: -240px -32px; }\n.ui-icon-arrowthick-1-n { background-position: 1px -48px; }\n.ui-icon-arrowthick-1-ne { background-position: -16px -48px; }\n.ui-icon-arrowthick-1-e { background-position: -32px -48px; }\n.ui-icon-arrowthick-1-se { background-position: -48px -48px; }\n.ui-icon-arrowthick-1-s { background-position: -64px -48px; }\n.ui-icon-arrowthick-1-sw { background-position: -80px -48px; }\n.ui-icon-arrowthick-1-w { background-position: -96px -48px; }\n.ui-icon-arrowthick-1-nw { background-position: -112px -48px; }\n.ui-icon-arrowthick-2-n-s { background-position: -128px -48px; }\n.ui-icon-arrowthick-2-ne-sw { background-position: -144px -48px; }\n.ui-icon-arrowthick-2-e-w { background-position: -160px -48px; }\n.ui-icon-arrowthick-2-se-nw { background-position: -176px -48px; }\n.ui-icon-arrowthickstop-1-n { background-position: -192px -48px; }\n.ui-icon-arrowthickstop-1-e { background-position: -208px -48px; }\n.ui-icon-arrowthickstop-1-s { background-position: -224px -48px; }\n.ui-icon-arrowthickstop-1-w { background-position: -240px -48px; }\n.ui-icon-arrowreturnthick-1-w { background-position: 0 -64px; }\n.ui-icon-arrowreturnthick-1-n { background-position: -16px -64px; }\n.ui-icon-arrowreturnthick-1-e { background-position: -32px -64px; }\n.ui-icon-arrowreturnthick-1-s { background-position: -48px -64px; }\n.ui-icon-arrowreturn-1-w { background-position: -64px -64px; }\n.ui-icon-arrowreturn-1-n { background-position: -80px -64px; }\n.ui-icon-arrowreturn-1-e { background-position: -96px -64px; }\n.ui-icon-arrowreturn-1-s { background-position: -112px -64px; }\n.ui-icon-arrowrefresh-1-w { background-position: -128px -64px; }\n.ui-icon-arrowrefresh-1-n { background-position: -144px -64px; }\n.ui-icon-arrowrefresh-1-e { background-position: -160px -64px; }\n.ui-icon-arrowrefresh-1-s { background-position: -176px -64px; }\n.ui-icon-arrow-4 { background-position: 0 -80px; }\n.ui-icon-arrow-4-diag { background-position: -16px -80px; }\n.ui-icon-extlink { background-position: -32px -80px; }\n.ui-icon-newwin { background-position: -48px -80px; }\n.ui-icon-refresh { background-position: -64px -80px; }\n.ui-icon-shuffle { background-position: -80px -80px; }\n.ui-icon-transfer-e-w { background-position: -96px -80px; }\n.ui-icon-transferthick-e-w { background-position: -112px -80px; }\n.ui-icon-folder-collapsed { background-position: 0 -96px; }\n.ui-icon-folder-open { background-position: -16px -96px; }\n.ui-icon-document { background-position: -32px -96px; }\n.ui-icon-document-b { background-position: -48px -96px; }\n.ui-icon-note { background-position: -64px -96px; }\n.ui-icon-mail-closed { background-position: -80px -96px; }\n.ui-icon-mail-open { background-position: -96px -96px; }\n.ui-icon-suitcase { background-position: -112px -96px; }\n.ui-icon-comment { background-position: -128px -96px; }\n.ui-icon-person { background-position: -144px -96px; }\n.ui-icon-print { background-position: -160px -96px; }\n.ui-icon-trash { background-position: -176px -96px; }\n.ui-icon-locked { background-position: -192px -96px; }\n.ui-icon-unlocked { background-position: -208px -96px; }\n.ui-icon-bookmark { background-position: -224px -96px; }\n.ui-icon-tag { background-position: -240px -96px; }\n.ui-icon-home { background-position: 0 -112px; }\n.ui-icon-flag { background-position: -16px -112px; }\n.ui-icon-calendar { background-position: -32px -112px; }\n.ui-icon-cart { background-position: -48px -112px; }\n.ui-icon-pencil { background-position: -64px -112px; }\n.ui-icon-clock { background-position: -80px -112px; }\n.ui-icon-disk { background-position: -96px -112px; }\n.ui-icon-calculator { background-position: -112px -112px; }\n.ui-icon-zoomin { background-position: -128px -112px; }\n.ui-icon-zoomout { background-position: -144px -112px; }\n.ui-icon-search { background-position: -160px -112px; }\n.ui-icon-wrench { background-position: -176px -112px; }\n.ui-icon-gear { background-position: -192px -112px; }\n.ui-icon-heart { background-position: -208px -112px; }\n.ui-icon-star { background-position: -224px -112px; }\n.ui-icon-link { background-position: -240px -112px; }\n.ui-icon-cancel { background-position: 0 -128px; }\n.ui-icon-plus { background-position: -16px -128px; }\n.ui-icon-plusthick { background-position: -32px -128px; }\n.ui-icon-minus { background-position: -48px -128px; }\n.ui-icon-minusthick { background-position: -64px -128px; }\n.ui-icon-close { background-position: -80px -128px; }\n.ui-icon-closethick { background-position: -96px -128px; }\n.ui-icon-key { background-position: -112px -128px; }\n.ui-icon-lightbulb { background-position: -128px -128px; }\n.ui-icon-scissors { background-position: -144px -128px; }\n.ui-icon-clipboard { background-position: -160px -128px; }\n.ui-icon-copy { background-position: -176px -128px; }\n.ui-icon-contact { background-position: -192px -128px; }\n.ui-icon-image { background-position: -208px -128px; }\n.ui-icon-video { background-position: -224px -128px; }\n.ui-icon-script { background-position: -240px -128px; }\n.ui-icon-alert { background-position: 0 -144px; }\n.ui-icon-info { background-position: -16px -144px; }\n.ui-icon-notice { background-position: -32px -144px; }\n.ui-icon-help { background-position: -48px -144px; }\n.ui-icon-check { background-position: -64px -144px; }\n.ui-icon-bullet { background-position: -80px -144px; }\n.ui-icon-radio-on { background-position: -96px -144px; }\n.ui-icon-radio-off { background-position: -112px -144px; }\n.ui-icon-pin-w { background-position: -128px -144px; }\n.ui-icon-pin-s { background-position: -144px -144px; }\n.ui-icon-play { background-position: 0 -160px; }\n.ui-icon-pause { background-position: -16px -160px; }\n.ui-icon-seek-next { background-position: -32px -160px; }\n.ui-icon-seek-prev { background-position: -48px -160px; }\n.ui-icon-seek-end { background-position: -64px -160px; }\n.ui-icon-seek-start { background-position: -80px -160px; }\n/* ui-icon-seek-first is deprecated, use ui-icon-seek-start instead */\n.ui-icon-seek-first { background-position: -80px -160px; }\n.ui-icon-stop { background-position: -96px -160px; }\n.ui-icon-eject { background-position: -112px -160px; }\n.ui-icon-volume-off { background-position: -128px -160px; }\n.ui-icon-volume-on { background-position: -144px -160px; }\n.ui-icon-power { background-position: 0 -176px; }\n.ui-icon-signal-diag { background-position: -16px -176px; }\n.ui-icon-signal { background-position: -32px -176px; }\n.ui-icon-battery-0 { background-position: -48px -176px; }\n.ui-icon-battery-1 { background-position: -64px -176px; }\n.ui-icon-battery-2 { background-position: -80px -176px; }\n.ui-icon-battery-3 { background-position: -96px -176px; }\n.ui-icon-circle-plus { background-position: 0 -192px; }\n.ui-icon-circle-minus { background-position: -16px -192px; }\n.ui-icon-circle-close { background-position: -32px -192px; }\n.ui-icon-circle-triangle-e { background-position: -48px -192px; }\n.ui-icon-circle-triangle-s { background-position: -64px -192px; }\n.ui-icon-circle-triangle-w { background-position: -80px -192px; }\n.ui-icon-circle-triangle-n { background-position: -96px -192px; }\n.ui-icon-circle-arrow-e { background-position: -112px -192px; }\n.ui-icon-circle-arrow-s { background-position: -128px -192px; }\n.ui-icon-circle-arrow-w { background-position: -144px -192px; }\n.ui-icon-circle-arrow-n { background-position: -160px -192px; }\n.ui-icon-circle-zoomin { background-position: -176px -192px; }\n.ui-icon-circle-zoomout { background-position: -192px -192px; }\n.ui-icon-circle-check { background-position: -208px -192px; }\n.ui-icon-circlesmall-plus { background-position: 0 -208px; }\n.ui-icon-circlesmall-minus { background-position: -16px -208px; }\n.ui-icon-circlesmall-close { background-position: -32px -208px; }\n.ui-icon-squaresmall-plus { background-position: -48px -208px; }\n.ui-icon-squaresmall-minus { background-position: -64px -208px; }\n.ui-icon-squaresmall-close { background-position: -80px -208px; }\n.ui-icon-grip-dotted-vertical { background-position: 0 -224px; }\n.ui-icon-grip-dotted-horizontal { background-position: -16px -224px; }\n.ui-icon-grip-solid-vertical { background-position: -32px -224px; }\n.ui-icon-grip-solid-horizontal { background-position: -48px -224px; }\n.ui-icon-gripsmall-diagonal-se { background-position: -64px -224px; }\n.ui-icon-grip-diagonal-se { background-position: -80px -224px; }\n\n\n/* Misc visuals\n----------------------------------*/\n\n/* Corner radius */\n.ui-corner-all,\n.ui-corner-top,\n.ui-corner-left,\n.ui-corner-tl {\n\tborder-top-left-radius: 3px/*{cornerRadius}*/;\n}\n.ui-corner-all,\n.ui-corner-top,\n.ui-corner-right,\n.ui-corner-tr {\n\tborder-top-right-radius: 3px/*{cornerRadius}*/;\n}\n.ui-corner-all,\n.ui-corner-bottom,\n.ui-corner-left,\n.ui-corner-bl {\n\tborder-bottom-left-radius: 3px/*{cornerRadius}*/;\n}\n.ui-corner-all,\n.ui-corner-bottom,\n.ui-corner-right,\n.ui-corner-br {\n\tborder-bottom-right-radius: 3px/*{cornerRadius}*/;\n}\n\n/* Overlays */\n.ui-widget-overlay {\n\tbackground: #aaaaaa/*{bgColorOverlay}*/ /*{bgImgUrlOverlay}*/ /*{bgOverlayXPos}*/ /*{bgOverlayYPos}*/ /*{bgOverlayRepeat}*/;\n\topacity: .3/*{opacityOverlay}*/;\n\tfilter: Alpha(Opacity=30)/*{opacityFilterOverlay}*/; /* support: IE8 */\n}\n.ui-widget-shadow {\n\t-webkit-box-shadow: 0/*{offsetLeftShadow}*/ 0/*{offsetTopShadow}*/ 5px/*{thicknessShadow}*/ #666666/*{bgColorShadow}*/;\n\tbox-shadow: 0/*{offsetLeftShadow}*/ 0/*{offsetTopShadow}*/ 5px/*{thicknessShadow}*/ #666666/*{bgColorShadow}*/;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  } // eslint-disable-next-line no-underscore-dangle, no-param-reassign


  url = url && url.__esModule ? url.default : url;

  if (typeof url !== 'string') {
    return url;
  } // If url is already wrapped in quotes, remove them


  if (/^['"].*['"]$/.test(url)) {
    // eslint-disable-next-line no-param-reassign
    url = url.slice(1, -1);
  }

  if (options.hash) {
    // eslint-disable-next-line no-param-reassign
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, '\\n'), "\"");
  }

  return url;
};

/***/ }),

/***/ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.eot?33lxn":
/*!********************************************************************************!*\
  !*** ./node_modules/jquery-contextmenu/dist/font/context-menu-icons.eot?33lxn ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "d1010e0ad2a7667cc67b7af3b8b5438e.eot");

/***/ }),

/***/ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.ttf?33lxn":
/*!********************************************************************************!*\
  !*** ./node_modules/jquery-contextmenu/dist/font/context-menu-icons.ttf?33lxn ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "5bd8d03df5227ac830eb9ed9afedc881.ttf");

/***/ }),

/***/ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.woff2?33lxn":
/*!**********************************************************************************!*\
  !*** ./node_modules/jquery-contextmenu/dist/font/context-menu-icons.woff2?33lxn ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "b2c2051d6098e38721efe1e62b4be1f3.woff2");

/***/ }),

/***/ "./node_modules/jquery-contextmenu/dist/font/context-menu-icons.woff?33lxn":
/*!*********************************************************************************!*\
  !*** ./node_modules/jquery-contextmenu/dist/font/context-menu-icons.woff?33lxn ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "e69f9f4740163f38b02d7c76f8f5c524.woff");

/***/ }),

/***/ "./node_modules/jquery-contextmenu/dist/jquery.contextMenu.js":
/*!********************************************************************!*\
  !*** ./node_modules/jquery-contextmenu/dist/jquery.contextMenu.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * jQuery contextMenu v2.9.2 - Plugin for simple contextMenu handling
 *
 * Version: v2.9.2
 *
 * Authors: Björn Brala (SWIS.nl), Rodney Rehm, Addy Osmani (patches for FF)
 * Web: http://swisnl.github.io/jQuery-contextMenu/
 *
 * Copyright (c) 2011-2020 SWIS BV and contributors
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 * Date: 2020-05-13T13:55:36.983Z
 */

// jscs:disable
/* jshint ignore:start */
(function (factory) {
    if (true) {
        // AMD. Register as anonymous module.
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
})(function ($) {

    'use strict';

    // TODO: -
    // ARIA stuff: menuitem, menuitemcheckbox und menuitemradio
    // create <menu> structure if $.support[htmlCommand || htmlMenuitem] and !opt.disableNative

    // determine html5 compatibility
    $.support.htmlMenuitem = ('HTMLMenuItemElement' in window);
    $.support.htmlCommand = ('HTMLCommandElement' in window);
    $.support.eventSelectstart = ('onselectstart' in document.documentElement);
    /* // should the need arise, test for css user-select
     $.support.cssUserSelect = (function(){
     var t = false,
     e = document.createElement('div');

     $.each('Moz|Webkit|Khtml|O|ms|Icab|'.split('|'), function(i, prefix) {
     var propCC = prefix + (prefix ? 'U' : 'u') + 'serSelect',
     prop = (prefix ? ('-' + prefix.toLowerCase() + '-') : '') + 'user-select';

     e.style.cssText = prop + ': text;';
     if (e.style[propCC] == 'text') {
     t = true;
     return false;
     }

     return true;
     });

     return t;
     })();
     */


    if (!$.ui || !$.widget) {
        // duck punch $.cleanData like jQueryUI does to get that remove event
        $.cleanData = (function (orig) {
            return function (elems) {
                var events, elem, i;
                for (i = 0; elems[i] != null; i++) {
                    elem = elems[i];
                    try {
                        // Only trigger remove when necessary to save time
                        events = $._data(elem, 'events');
                        if (events && events.remove) {
                            $(elem).triggerHandler('remove');
                        }

                        // Http://bugs.jquery.com/ticket/8235
                    } catch (e) {
                    }
                }
                orig(elems);
            };
        })($.cleanData);
    }
    /* jshint ignore:end */
    // jscs:enable

    var // currently active contextMenu trigger
        $currentTrigger = null,
        // is contextMenu initialized with at least one menu?
        initialized = false,
        // window handle
        $win = $(window),
        // number of registered menus
        counter = 0,
        // mapping selector to namespace
        namespaces = {},
        // mapping namespace to options
        menus = {},
        // custom command type handlers
        types = {},
        // default values
        defaults = {
            // selector of contextMenu trigger
            selector: null,
            // where to append the menu to
            appendTo: null,
            // method to trigger context menu ["right", "left", "hover"]
            trigger: 'right',
            // hide menu when mouse leaves trigger / menu elements
            autoHide: false,
            // ms to wait before showing a hover-triggered context menu
            delay: 200,
            // flag denoting if a second trigger should simply move (true) or rebuild (false) an open menu
            // as long as the trigger happened on one of the trigger-element's child nodes
            reposition: true,
            // Flag denoting if a second trigger should close the menu, as long as
            // the trigger happened on one of the trigger-element's child nodes.
            // This overrides the reposition option.
            hideOnSecondTrigger: false,

            //ability to select submenu
            selectableSubMenu: false,

            // Default classname configuration to be able avoid conflicts in frameworks
            classNames: {
                hover: 'context-menu-hover', // Item hover
                disabled: 'context-menu-disabled', // Item disabled
                visible: 'context-menu-visible', // Item visible
                notSelectable: 'context-menu-not-selectable', // Item not selectable

                icon: 'context-menu-icon',
                iconEdit: 'context-menu-icon-edit',
                iconCut: 'context-menu-icon-cut',
                iconCopy: 'context-menu-icon-copy',
                iconPaste: 'context-menu-icon-paste',
                iconDelete: 'context-menu-icon-delete',
                iconAdd: 'context-menu-icon-add',
                iconQuit: 'context-menu-icon-quit',
                iconLoadingClass: 'context-menu-icon-loading'
            },

            // determine position to show menu at
            determinePosition: function ($menu) {
                // position to the lower middle of the trigger element
                if ($.ui && $.ui.position) {
                    // .position() is provided as a jQuery UI utility
                    // (...and it won't work on hidden elements)
                    $menu.css('display', 'block').position({
                        my: 'center top',
                        at: 'center bottom',
                        of: this,
                        offset: '0 5',
                        collision: 'fit'
                    }).css('display', 'none');
                } else {
                    // determine contextMenu position
                    var offset = this.offset();
                    offset.top += this.outerHeight();
                    offset.left += this.outerWidth() / 2 - $menu.outerWidth() / 2;
                    $menu.css(offset);
                }
            },
            // position menu
            position: function (opt, x, y) {
                var offset;
                // determine contextMenu position
                if (!x && !y) {
                    opt.determinePosition.call(this, opt.$menu);
                    return;
                } else if (x === 'maintain' && y === 'maintain') {
                    // x and y must not be changed (after re-show on command click)
                    offset = opt.$menu.position();
                } else {
                    // x and y are given (by mouse event)
                    var offsetParentOffset = opt.$menu.offsetParent().offset();
                    offset = {top: y - offsetParentOffset.top, left: x -offsetParentOffset.left};
                }

                // correct offset if viewport demands it
                var bottom = $win.scrollTop() + $win.height(),
                    right = $win.scrollLeft() + $win.width(),
                    height = opt.$menu.outerHeight(),
                    width = opt.$menu.outerWidth();

                if (offset.top + height > bottom) {
                    offset.top -= height;
                }

                if (offset.top < 0) {
                    offset.top = 0;
                }

                if (offset.left + width > right) {
                    offset.left -= width;
                }

                if (offset.left < 0) {
                    offset.left = 0;
                }

                opt.$menu.css(offset);
            },
            // position the sub-menu
            positionSubmenu: function ($menu) {
                if (typeof $menu === 'undefined') {
                    // When user hovers over item (which has sub items) handle.focusItem will call this.
                    // but the submenu does not exist yet if opt.items is a promise. just return, will
                    // call positionSubmenu after promise is completed.
                    return;
                }
                if ($.ui && $.ui.position) {
                    // .position() is provided as a jQuery UI utility
                    // (...and it won't work on hidden elements)
                    $menu.css('display', 'block').position({
                        my: 'left top-5',
                        at: 'right top',
                        of: this,
                        collision: 'flipfit fit'
                    }).css('display', '');
                } else {
                    // determine contextMenu position
                    var offset = {
                        top: -9,
                        left: this.outerWidth() - 5
                    };
                    $menu.css(offset);
                }
            },
            // offset to add to zIndex
            zIndex: 1,
            // show hide animation settings
            animation: {
                duration: 50,
                show: 'slideDown',
                hide: 'slideUp'
            },
            // events
            events: {
                preShow: $.noop,
                show: $.noop,
                hide: $.noop,
                activated: $.noop
            },
            // default callback
            callback: null,
            // list of contextMenu items
            items: {}
        },
        // mouse position for hover activation
        hoveract = {
            timer: null,
            pageX: null,
            pageY: null
        },
        // determine zIndex
        zindex = function ($t) {
            var zin = 0,
                $tt = $t;

            while (true) {
                zin = Math.max(zin, parseInt($tt.css('z-index'), 10) || 0);
                $tt = $tt.parent();
                if (!$tt || !$tt.length || 'html body'.indexOf($tt.prop('nodeName').toLowerCase()) > -1) {
                    break;
                }
            }
            return zin;
        },
        // event handlers
        handle = {
            // abort anything
            abortevent: function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
            },
            // contextmenu show dispatcher
            contextmenu: function (e) {
                var $this = $(this);

                //Show browser context-menu when preShow returns false
                if (e.data.events.preShow($this,e) === false) {
                    return;
                }

                // disable actual context-menu if we are using the right mouse button as the trigger
                if (e.data.trigger === 'right') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }

                // abort native-triggered events unless we're triggering on right click
                if ((e.data.trigger !== 'right' && e.data.trigger !== 'demand') && e.originalEvent) {
                    return;
                }

                // Let the current contextmenu decide if it should show or not based on its own trigger settings
                if (typeof e.mouseButton !== 'undefined' && e.data) {
                    if (!(e.data.trigger === 'left' && e.mouseButton === 0) && !(e.data.trigger === 'right' && e.mouseButton === 2)) {
                        // Mouse click is not valid.
                        return;
                    }
                }

                // abort event if menu is visible for this trigger
                if ($this.hasClass('context-menu-active')) {
                    return;
                }

                if (!$this.hasClass('context-menu-disabled')) {
                    // theoretically need to fire a show event at <menu>
                    // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#context-menus
                    // var evt = jQuery.Event("show", { data: data, pageX: e.pageX, pageY: e.pageY, relatedTarget: this });
                    // e.data.$menu.trigger(evt);

                    $currentTrigger = $this;
                    if (e.data.build) {
                        var built = e.data.build($currentTrigger, e);
                        // abort if build() returned false
                        if (built === false) {
                            return;
                        }

                        // dynamically build menu on invocation
                        e.data = $.extend(true, {}, defaults, e.data, built || {});

                        // abort if there are no items to display
                        if (!e.data.items || $.isEmptyObject(e.data.items)) {
                            // Note: jQuery captures and ignores errors from event handlers
                            if (window.console) {
                                (console.error || console.log).call(console, 'No items specified to show in contextMenu');
                            }

                            throw new Error('No Items specified');
                        }

                        // backreference for custom command type creation
                        e.data.$trigger = $currentTrigger;

                        op.create(e.data);
                    }
                    op.show.call($this, e.data, e.pageX, e.pageY);
                }
            },
            // contextMenu left-click trigger
            click: function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $(this).trigger($.Event('contextmenu', {data: e.data, pageX: e.pageX, pageY: e.pageY}));
            },
            // contextMenu right-click trigger
            mousedown: function (e) {
                // register mouse down
                var $this = $(this);

                // hide any previous menus
                if ($currentTrigger && $currentTrigger.length && !$currentTrigger.is($this)) {
                    $currentTrigger.data('contextMenu').$menu.trigger('contextmenu:hide');
                }

                // activate on right click
                if (e.button === 2) {
                    $currentTrigger = $this.data('contextMenuActive', true);
                }
            },
            // contextMenu right-click trigger
            mouseup: function (e) {
                // show menu
                var $this = $(this);
                if ($this.data('contextMenuActive') && $currentTrigger && $currentTrigger.length && $currentTrigger.is($this) && !$this.hasClass('context-menu-disabled')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    $currentTrigger = $this;
                    $this.trigger($.Event('contextmenu', {data: e.data, pageX: e.pageX, pageY: e.pageY}));
                }

                $this.removeData('contextMenuActive');
            },
            // contextMenu hover trigger
            mouseenter: function (e) {
                var $this = $(this),
                    $related = $(e.relatedTarget),
                    $document = $(document);

                // abort if we're coming from a menu
                if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
                    return;
                }

                // abort if a menu is shown
                if ($currentTrigger && $currentTrigger.length) {
                    return;
                }

                hoveract.pageX = e.pageX;
                hoveract.pageY = e.pageY;
                hoveract.data = e.data;
                $document.on('mousemove.contextMenuShow', handle.mousemove);
                hoveract.timer = setTimeout(function () {
                    hoveract.timer = null;
                    $document.off('mousemove.contextMenuShow');
                    $currentTrigger = $this;
                    $this.trigger($.Event('contextmenu', {
                        data: hoveract.data,
                        pageX: hoveract.pageX,
                        pageY: hoveract.pageY
                    }));
                }, e.data.delay);
            },
            // contextMenu hover trigger
            mousemove: function (e) {
                hoveract.pageX = e.pageX;
                hoveract.pageY = e.pageY;
            },
            // contextMenu hover trigger
            mouseleave: function (e) {
                // abort if we're leaving for a menu
                var $related = $(e.relatedTarget);
                if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
                    return;
                }

                try {
                    clearTimeout(hoveract.timer);
                } catch (e) {
                }

                hoveract.timer = null;
            },
            // click on layer to hide contextMenu
            layerClick: function (e) {
                var $this = $(this),
                    root = $this.data('contextMenuRoot'),
                    button = e.button,
                    x = e.pageX,
                    y = e.pageY,
                    fakeClick = x === undefined,
                    target,
                    offset;

                e.preventDefault();

                setTimeout(function () {
                    // If the click is not real, things break: https://github.com/swisnl/jQuery-contextMenu/issues/132
                    if(fakeClick){
                        if (root !== null && typeof root !== 'undefined' && root.$menu !== null  && typeof root.$menu !== 'undefined') {
                            root.$menu.trigger('contextmenu:hide');
                        }
                        return;
                    }

                    var $window;
                    var triggerAction = ((root.trigger === 'left' && button === 0) || (root.trigger === 'right' && button === 2));

                    // find the element that would've been clicked, wasn't the layer in the way
                    if (document.elementFromPoint && root.$layer) {
                        root.$layer.hide();
                        target = document.elementFromPoint(x - $win.scrollLeft(), y - $win.scrollTop());

                        // also need to try and focus this element if we're in a contenteditable area,
                        // as the layer will prevent the browser mouse action we want
                        if (target !== null && target.isContentEditable) {
                            var range = document.createRange(),
                                sel = window.getSelection();
                            range.selectNode(target);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                        $(target).trigger(e);
                        root.$layer.show();
                    }

                    if (root.hideOnSecondTrigger && triggerAction && root.$menu !== null && typeof root.$menu !== 'undefined') {
                      root.$menu.trigger('contextmenu:hide');
                      return;
                    }

                    if (root.reposition && triggerAction) {
                        if (document.elementFromPoint) {
                            if (root.$trigger.is(target)) {
                                root.position.call(root.$trigger, root, x, y);
                                return;
                            }
                        } else {
                            offset = root.$trigger.offset();
                            $window = $(window);
                            // while this looks kinda awful, it's the best way to avoid
                            // unnecessarily calculating any positions
                            offset.top += $window.scrollTop();
                            if (offset.top <= e.pageY) {
                                offset.left += $window.scrollLeft();
                                if (offset.left <= e.pageX) {
                                    offset.bottom = offset.top + root.$trigger.outerHeight();
                                    if (offset.bottom >= e.pageY) {
                                        offset.right = offset.left + root.$trigger.outerWidth();
                                        if (offset.right >= e.pageX) {
                                            // reposition
                                            root.position.call(root.$trigger, root, x, y);
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (target && triggerAction) {
                        root.$trigger.one('contextmenu:hidden', function () {
                            $(target).contextMenu({x: x, y: y, button: button});
                        });
                    }

                    if (root !== null && typeof root !== 'undefined' && root.$menu !== null  && typeof root.$menu !== 'undefined') {
                        root.$menu.trigger('contextmenu:hide');
                    }
                }, 50);
            },
            // key handled :hover
            keyStop: function (e, opt) {
                if (!opt.isInput) {
                    e.preventDefault();
                }

                e.stopPropagation();
            },
            key: function (e) {

                var opt = {};

                // Only get the data from $currentTrigger if it exists
                if ($currentTrigger) {
                    opt = $currentTrigger.data('contextMenu') || {};
                }
                // If the trigger happen on a element that are above the contextmenu do this
                if (typeof opt.zIndex === 'undefined') {
                    opt.zIndex = 0;
                }
                var targetZIndex = 0;
                var getZIndexOfTriggerTarget = function (target) {
                    if (target.style.zIndex !== '') {
                        targetZIndex = target.style.zIndex;
                    } else {
                        if (target.offsetParent !== null && typeof target.offsetParent !== 'undefined') {
                            getZIndexOfTriggerTarget(target.offsetParent);
                        }
                        else if (target.parentElement !== null && typeof target.parentElement !== 'undefined') {
                            getZIndexOfTriggerTarget(target.parentElement);
                        }
                    }
                };
                getZIndexOfTriggerTarget(e.target);
                // If targetZIndex is heigher then opt.zIndex dont progress any futher.
                // This is used to make sure that if you are using a dialog with a input / textarea / contenteditable div
                // and its above the contextmenu it wont steal keys events
                if (opt.$menu && parseInt(targetZIndex,10) > parseInt(opt.$menu.css("zIndex"),10)) {
                    return;
                }
                switch (e.keyCode) {
                    case 9:
                    case 38: // up
                        handle.keyStop(e, opt);
                        // if keyCode is [38 (up)] or [9 (tab) with shift]
                        if (opt.isInput) {
                            if (e.keyCode === 9 && e.shiftKey) {
                                e.preventDefault();
                                if (opt.$selected) {
                                    opt.$selected.find('input, textarea, select').blur();
                                }
                                if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                    opt.$menu.trigger('prevcommand');
                                }
                                return;
                            } else if (e.keyCode === 38 && opt.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
                                // checkboxes don't capture this key
                                e.preventDefault();
                                return;
                            }
                        } else if (e.keyCode !== 9 || e.shiftKey) {
                            if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                opt.$menu.trigger('prevcommand');
                            }
                            return;
                        }
                        break;
                    // omitting break;
                    // case 9: // tab - reached through omitted break;
                    case 40: // down
                        handle.keyStop(e, opt);
                        if (opt.isInput) {
                            if (e.keyCode === 9) {
                                e.preventDefault();
                                if (opt.$selected) {
                                    opt.$selected.find('input, textarea, select').blur();
                                }
                                if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                    opt.$menu.trigger('nextcommand');
                                }
                                return;
                            } else if (e.keyCode === 40 && opt.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
                                // checkboxes don't capture this key
                                e.preventDefault();
                                return;
                            }
                        } else {
                            if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                opt.$menu.trigger('nextcommand');
                            }
                            return;
                        }
                        break;

                    case 37: // left
                        handle.keyStop(e, opt);
                        if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                            break;
                        }

                        if (!opt.$selected.parent().hasClass('context-menu-root')) {
                            var $parent = opt.$selected.parent().parent();
                            opt.$selected.trigger('contextmenu:blur');
                            opt.$selected = $parent;
                            return;
                        }
                        break;

                    case 39: // right
                        handle.keyStop(e, opt);
                        if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                            break;
                        }

                        var itemdata = opt.$selected.data('contextMenu') || {};
                        if (itemdata.$menu && opt.$selected.hasClass('context-menu-submenu')) {
                            opt.$selected = null;
                            itemdata.$selected = null;
                            itemdata.$menu.trigger('nextcommand');
                            return;
                        }
                        break;

                    case 35: // end
                    case 36: // home
                        if (opt.$selected && opt.$selected.find('input, textarea, select').length) {
                            return;
                        } else {
                            (opt.$selected && opt.$selected.parent() || opt.$menu)
                                .children(':not(.' + opt.classNames.disabled + ', .' + opt.classNames.notSelectable + ')')[e.keyCode === 36 ? 'first' : 'last']()
                                .trigger('contextmenu:focus');
                            e.preventDefault();
                            return;
                        }
                        break;

                    case 13: // enter
                        handle.keyStop(e, opt);
                        if (opt.isInput) {
                            if (opt.$selected && !opt.$selected.is('textarea, select')) {
                                e.preventDefault();
                                return;
                            }
                            break;
                        }
                        if (typeof opt.$selected !== 'undefined' && opt.$selected !== null) {
                            opt.$selected.trigger('mouseup');
                        }
                        return;

                    case 32: // space
                    case 33: // page up
                    case 34: // page down
                        // prevent browser from scrolling down while menu is visible
                        handle.keyStop(e, opt);
                        return;

                    case 27: // esc
                        handle.keyStop(e, opt);
                        if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                            opt.$menu.trigger('contextmenu:hide');
                        }
                        return;

                    default: // 0-9, a-z
                        var k = (String.fromCharCode(e.keyCode)).toUpperCase();
                        if (opt.accesskeys && opt.accesskeys[k]) {
                            // according to the specs accesskeys must be invoked immediately
                            opt.accesskeys[k].$node.trigger(opt.accesskeys[k].$menu ? 'contextmenu:focus' : 'mouseup');
                            return;
                        }
                        break;
                }
                // pass event to selected item,
                // stop propagation to avoid endless recursion
                e.stopPropagation();
                if (typeof opt.$selected !== 'undefined' && opt.$selected !== null) {
                    opt.$selected.trigger(e);
                }
            },
            // select previous possible command in menu
            prevItem: function (e) {
                e.stopPropagation();
                var opt = $(this).data('contextMenu') || {};
                var root = $(this).data('contextMenuRoot') || {};

                // obtain currently selected menu
                if (opt.$selected) {
                    var $s = opt.$selected;
                    opt = opt.$selected.parent().data('contextMenu') || {};
                    opt.$selected = $s;
                }

                var $children = opt.$menu.children(),
                    $prev = !opt.$selected || !opt.$selected.prev().length ? $children.last() : opt.$selected.prev(),
                    $round = $prev;

                // skip disabled or hidden elements
                while ($prev.hasClass(root.classNames.disabled) || $prev.hasClass(root.classNames.notSelectable) || $prev.is(':hidden')) {
                    if ($prev.prev().length) {
                        $prev = $prev.prev();
                    } else {
                        $prev = $children.last();
                    }
                    if ($prev.is($round)) {
                        // break endless loop
                        return;
                    }
                }

                // leave current
                if (opt.$selected) {
                    handle.itemMouseleave.call(opt.$selected.get(0), e);
                }

                // activate next
                handle.itemMouseenter.call($prev.get(0), e);

                // focus input
                var $input = $prev.find('input, textarea, select');
                if ($input.length) {
                    $input.focus();
                }
            },
            // select next possible command in menu
            nextItem: function (e) {
                e.stopPropagation();
                var opt = $(this).data('contextMenu') || {};
                var root = $(this).data('contextMenuRoot') || {};

                // obtain currently selected menu
                if (opt.$selected) {
                    var $s = opt.$selected;
                    opt = opt.$selected.parent().data('contextMenu') || {};
                    opt.$selected = $s;
                }

                var $children = opt.$menu.children(),
                    $next = !opt.$selected || !opt.$selected.next().length ? $children.first() : opt.$selected.next(),
                    $round = $next;

                // skip disabled
                while ($next.hasClass(root.classNames.disabled) || $next.hasClass(root.classNames.notSelectable) || $next.is(':hidden')) {
                    if ($next.next().length) {
                        $next = $next.next();
                    } else {
                        $next = $children.first();
                    }
                    if ($next.is($round)) {
                        // break endless loop
                        return;
                    }
                }

                // leave current
                if (opt.$selected) {
                    handle.itemMouseleave.call(opt.$selected.get(0), e);
                }

                // activate next
                handle.itemMouseenter.call($next.get(0), e);

                // focus input
                var $input = $next.find('input, textarea, select');
                if ($input.length) {
                    $input.focus();
                }
            },
            // flag that we're inside an input so the key handler can act accordingly
            focusInput: function () {
                var $this = $(this).closest('.context-menu-item'),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                root.$selected = opt.$selected = $this;
                root.isInput = opt.isInput = true;
            },
            // flag that we're inside an input so the key handler can act accordingly
            blurInput: function () {
                var $this = $(this).closest('.context-menu-item'),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                root.isInput = opt.isInput = false;
            },
            // :hover on menu
            menuMouseenter: function () {
                var root = $(this).data().contextMenuRoot;
                root.hovering = true;
            },
            // :hover on menu
            menuMouseleave: function (e) {
                var root = $(this).data().contextMenuRoot;
                if (root.$layer && root.$layer.is(e.relatedTarget)) {
                    root.hovering = false;
                }
            },
            // :hover done manually so key handling is possible
            itemMouseenter: function (e) {
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                root.hovering = true;

                // abort if we're re-entering
                if (e && root.$layer && root.$layer.is(e.relatedTarget)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }

                // make sure only one item is selected
                (opt.$menu ? opt : root).$menu
                    .children('.' + root.classNames.hover).trigger('contextmenu:blur')
                    .children('.hover').trigger('contextmenu:blur');

                if ($this.hasClass(root.classNames.disabled) || $this.hasClass(root.classNames.notSelectable)) {
                    opt.$selected = null;
                    return;
                }


                $this.trigger('contextmenu:focus');
            },
            // :hover done manually so key handling is possible
            itemMouseleave: function (e) {
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                if (root !== opt && root.$layer && root.$layer.is(e.relatedTarget)) {
                    if (typeof root.$selected !== 'undefined' && root.$selected !== null) {
                        root.$selected.trigger('contextmenu:blur');
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    root.$selected = opt.$selected = opt.$node;
                    return;
                }

                if(opt && opt.$menu && opt.$menu.hasClass('context-menu-visible')){
                    return;
                }

                $this.trigger('contextmenu:blur');
            },
            // contextMenu item click
            itemClick: function (e) {
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot,
                    key = data.contextMenuKey,
                    callback;

                // abort if the key is unknown or disabled or is a menu
                if (!opt.items[key] || $this.is('.' + root.classNames.disabled + ', .context-menu-separator, .' + root.classNames.notSelectable) || ($this.is('.context-menu-submenu') && root.selectableSubMenu === false )) {
                    return;
                }

                e.preventDefault();
                e.stopImmediatePropagation();

                if ($.isFunction(opt.callbacks[key]) && Object.prototype.hasOwnProperty.call(opt.callbacks, key)) {
                    // item-specific callback
                    callback = opt.callbacks[key];
                } else if ($.isFunction(root.callback)) {
                    // default callback
                    callback = root.callback;
                } else {
                    // no callback, no action
                    return;
                }

                // hide menu if callback doesn't stop that
                if (callback.call(root.$trigger, key, root, e) !== false) {
                    root.$menu.trigger('contextmenu:hide');
                } else if (root.$menu.parent().length) {
                    op.update.call(root.$trigger, root);
                }
            },
            // ignore click events on input elements
            inputClick: function (e) {
                e.stopImmediatePropagation();
            },
            // hide <menu>
            hideMenu: function (e, data) {
                var root = $(this).data('contextMenuRoot');
                op.hide.call(root.$trigger, root, data && data.force);
            },
            // focus <command>
            focusItem: function (e) {
                e.stopPropagation();
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                if ($this.hasClass(root.classNames.disabled) || $this.hasClass(root.classNames.notSelectable)) {
                    return;
                }

                $this
                    .addClass([root.classNames.hover, root.classNames.visible].join(' '))
                    // select other items and included items
                    .parent().find('.context-menu-item').not($this)
                    .removeClass(root.classNames.visible)
                    .filter('.' + root.classNames.hover)
                    .trigger('contextmenu:blur');

                // remember selected
                opt.$selected = root.$selected = $this;


                if(opt && opt.$node && opt.$node.hasClass('context-menu-submenu')){
                    opt.$node.addClass(root.classNames.hover);
                }

                // position sub-menu - do after show so dumb $.ui.position can keep up
                if (opt.$node) {
                    root.positionSubmenu.call(opt.$node, opt.$menu);
                }
            },
            // blur <command>
            blurItem: function (e) {
                e.stopPropagation();
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                if (opt.autoHide) { // for tablets and touch screens this needs to remain
                    $this.removeClass(root.classNames.visible);
                }
                $this.removeClass(root.classNames.hover);
                opt.$selected = null;
            }
        },
        // operations
        op = {
            show: function (opt, x, y) {
                var $trigger = $(this),
                    css = {};

                // hide any open menus
                $('#context-menu-layer').trigger('mousedown');

                // backreference for callbacks
                opt.$trigger = $trigger;

                // show event
                if (opt.events.show.call($trigger, opt) === false) {
                    $currentTrigger = null;
                    return;
                }

                // create or update context menu
                var hasVisibleItems = op.update.call($trigger, opt);
                if (hasVisibleItems === false) {
                    $currentTrigger = null;
                    return;
                }

                // position menu
                opt.position.call($trigger, opt, x, y);

                // make sure we're in front
                if (opt.zIndex) {
                    var additionalZValue = opt.zIndex;
                    // If opt.zIndex is a function, call the function to get the right zIndex.
                    if (typeof opt.zIndex === 'function') {
                        additionalZValue = opt.zIndex.call($trigger, opt);
                    }
                    css.zIndex = zindex($trigger) + additionalZValue;
                }

                // add layer
                op.layer.call(opt.$menu, opt, css.zIndex);

                // adjust sub-menu zIndexes
                opt.$menu.find('ul').css('zIndex', css.zIndex + 1);

                // position and show context menu
                opt.$menu.css(css)[opt.animation.show](opt.animation.duration, function () {
                    $trigger.trigger('contextmenu:visible');

                    op.activated(opt);
                    opt.events.activated(opt);
                });
                // make options available and set state
                $trigger
                    .data('contextMenu', opt)
                    .addClass('context-menu-active');

                // register key handler
                $(document).off('keydown.contextMenu').on('keydown.contextMenu', handle.key);
                // register autoHide handler
                if (opt.autoHide) {
                    // mouse position handler
                    $(document).on('mousemove.contextMenuAutoHide', function (e) {
                        // need to capture the offset on mousemove,
                        // since the page might've been scrolled since activation
                        var pos = $trigger.offset();
                        pos.right = pos.left + $trigger.outerWidth();
                        pos.bottom = pos.top + $trigger.outerHeight();

                        if (opt.$layer && !opt.hovering && (!(e.pageX >= pos.left && e.pageX <= pos.right) || !(e.pageY >= pos.top && e.pageY <= pos.bottom))) {
                            /* Additional hover check after short time, you might just miss the edge of the menu */
                            setTimeout(function () {
                                if (!opt.hovering && opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                    opt.$menu.trigger('contextmenu:hide');
                                }
                            }, 50);
                        }
                    });
                }
            },
            hide: function (opt, force) {
                var $trigger = $(this);
                if (!opt) {
                    opt = $trigger.data('contextMenu') || {};
                }

                // hide event
                if (!force && opt.events && opt.events.hide.call($trigger, opt) === false) {
                    return;
                }

                // remove options and revert state
                $trigger
                    .removeData('contextMenu')
                    .removeClass('context-menu-active');

                if (opt.$layer) {
                    // keep layer for a bit so the contextmenu event can be aborted properly by opera
                    setTimeout((function ($layer) {
                        return function () {
                            $layer.remove();
                        };
                    })(opt.$layer), 10);

                    try {
                        delete opt.$layer;
                    } catch (e) {
                        opt.$layer = null;
                    }
                }

                // remove handle
                $currentTrigger = null;
                // remove selected
                opt.$menu.find('.' + opt.classNames.hover).trigger('contextmenu:blur');
                opt.$selected = null;
                // collapse all submenus
                opt.$menu.find('.' + opt.classNames.visible).removeClass(opt.classNames.visible);
                // unregister key and mouse handlers
                // $(document).off('.contextMenuAutoHide keydown.contextMenu'); // http://bugs.jquery.com/ticket/10705
                $(document).off('.contextMenuAutoHide').off('keydown.contextMenu');
                // hide menu
                if (opt.$menu) {
                    opt.$menu[opt.animation.hide](opt.animation.duration, function () {
                        // tear down dynamically built menu after animation is completed.
                        if (opt.build) {
                            opt.$menu.remove();
                            $.each(opt, function (key) {
                                switch (key) {
                                    case 'ns':
                                    case 'selector':
                                    case 'build':
                                    case 'trigger':
                                        return true;

                                    default:
                                        opt[key] = undefined;
                                        try {
                                            delete opt[key];
                                        } catch (e) {
                                        }
                                        return true;
                                }
                            });
                        }

                        setTimeout(function () {
                            $trigger.trigger('contextmenu:hidden');
                        }, 10);
                    });
                }
            },
            create: function (opt, root) {
                if (typeof root === 'undefined') {
                    root = opt;
                }

                // create contextMenu
                opt.$menu = $('<ul class="context-menu-list"></ul>').addClass(opt.className || '').data({
                    'contextMenu': opt,
                    'contextMenuRoot': root
                });
                if(opt.dataAttr){
                    $.each(opt.dataAttr, function (key, item) {
                        opt.$menu.attr('data-' + opt.key, item);
                    });
                }

                $.each(['callbacks', 'commands', 'inputs'], function (i, k) {
                    opt[k] = {};
                    if (!root[k]) {
                        root[k] = {};
                    }
                });

                if (!root.accesskeys) {
                    root.accesskeys = {};
                }

                function createNameNode(item) {
                    var $name = $('<span></span>');
                    if (item._accesskey) {
                        if (item._beforeAccesskey) {
                            $name.append(document.createTextNode(item._beforeAccesskey));
                        }
                        $('<span></span>')
                            .addClass('context-menu-accesskey')
                            .text(item._accesskey)
                            .appendTo($name);
                        if (item._afterAccesskey) {
                            $name.append(document.createTextNode(item._afterAccesskey));
                        }
                    } else {
                        if (item.isHtmlName) {
                            // restrict use with access keys
                            if (typeof item.accesskey !== 'undefined') {
                                throw new Error('accesskeys are not compatible with HTML names and cannot be used together in the same item');
                            }
                            $name.html(item.name);
                        } else {
                            $name.text(item.name);
                        }
                    }
                    return $name;
                }

                // create contextMenu items
                $.each(opt.items, function (key, item) {
                    var $t = $('<li class="context-menu-item"></li>').addClass(item.className || ''),
                        $label = null,
                        $input = null;

                    // iOS needs to see a click-event bound to an element to actually
                    // have the TouchEvents infrastructure trigger the click event
                    $t.on('click', $.noop);

                    // Make old school string seperator a real item so checks wont be
                    // akward later.
                    // And normalize 'cm_separator' into 'cm_seperator'.
                    if (typeof item === 'string' || item.type === 'cm_separator') {
                        item = {type: 'cm_seperator'};
                    }

                    item.$node = $t.data({
                        'contextMenu': opt,
                        'contextMenuRoot': root,
                        'contextMenuKey': key
                    });

                    // register accesskey
                    // NOTE: the accesskey attribute should be applicable to any element, but Safari5 and Chrome13 still can't do that
                    if (typeof item.accesskey !== 'undefined') {
                        var aks = splitAccesskey(item.accesskey);
                        for (var i = 0, ak; ak = aks[i]; i++) {
                            if (!root.accesskeys[ak]) {
                                root.accesskeys[ak] = item;
                                var matched = item.name.match(new RegExp('^(.*?)(' + ak + ')(.*)$', 'i'));
                                if (matched) {
                                    item._beforeAccesskey = matched[1];
                                    item._accesskey = matched[2];
                                    item._afterAccesskey = matched[3];
                                }
                                break;
                            }
                        }
                    }

                    if (item.type && types[item.type]) {
                        // run custom type handler
                        types[item.type].call($t, item, opt, root);
                        // register commands
                        $.each([opt, root], function (i, k) {
                            k.commands[key] = item;
                            // Overwrite only if undefined or the item is appended to the root. This so it
                            // doesn't overwrite callbacks of root elements if the name is the same.
                            if ($.isFunction(item.callback) && (typeof k.callbacks[key] === 'undefined' || typeof opt.type === 'undefined')) {
                                k.callbacks[key] = item.callback;
                            }
                        });
                    } else {
                        // add label for input
                        if (item.type === 'cm_seperator') {
                            $t.addClass('context-menu-separator ' + root.classNames.notSelectable);
                        } else if (item.type === 'html') {
                            $t.addClass('context-menu-html ' + root.classNames.notSelectable);
                        } else if (item.type !== 'sub' && item.type) {
                            $label = $('<label></label>').appendTo($t);
                            createNameNode(item).appendTo($label);

                            $t.addClass('context-menu-input');
                            opt.hasTypes = true;
                            $.each([opt, root], function (i, k) {
                                k.commands[key] = item;
                                k.inputs[key] = item;
                            });
                        } else if (item.items) {
                            item.type = 'sub';
                        }

                        switch (item.type) {
                            case 'cm_seperator':
                                break;

                            case 'text':
                                $input = $('<input type="text" value="1" name="" />')
                                    .attr('name', 'context-menu-input-' + key)
                                    .val(item.value || '')
                                    .appendTo($label);
                                break;

                            case 'textarea':
                                $input = $('<textarea name=""></textarea>')
                                    .attr('name', 'context-menu-input-' + key)
                                    .val(item.value || '')
                                    .appendTo($label);

                                if (item.height) {
                                    $input.height(item.height);
                                }
                                break;

                            case 'checkbox':
                                $input = $('<input type="checkbox" value="1" name="" />')
                                    .attr('name', 'context-menu-input-' + key)
                                    .val(item.value || '')
                                    .prop('checked', !!item.selected)
                                    .prependTo($label);
                                break;

                            case 'radio':
                                $input = $('<input type="radio" value="1" name="" />')
                                    .attr('name', 'context-menu-input-' + item.radio)
                                    .val(item.value || '')
                                    .prop('checked', !!item.selected)
                                    .prependTo($label);
                                break;

                            case 'select':
                                $input = $('<select name=""></select>')
                                    .attr('name', 'context-menu-input-' + key)
                                    .appendTo($label);
                                if (item.options) {
                                    $.each(item.options, function (value, text) {
                                        $('<option></option>').val(value).text(text).appendTo($input);
                                    });
                                    $input.val(item.selected);
                                }
                                break;

                            case 'sub':
                                createNameNode(item).appendTo($t);
                                item.appendTo = item.$node;
                                $t.data('contextMenu', item).addClass('context-menu-submenu');
                                item.callback = null;

                                // If item contains items, and this is a promise, we should create it later
                                // check if subitems is of type promise. If it is a promise we need to create
                                // it later, after promise has been resolved.
                                if ('function' === typeof item.items.then) {
                                    // probably a promise, process it, when completed it will create the sub menu's.
                                    op.processPromises(item, root, item.items);
                                } else {
                                    // normal submenu.
                                    op.create(item, root);
                                }
                                break;

                            case 'html':
                                $(item.html).appendTo($t);
                                break;

                            default:
                                $.each([opt, root], function (i, k) {
                                    k.commands[key] = item;
                                    // Overwrite only if undefined or the item is appended to the root. This so it
                                    // doesn't overwrite callbacks of root elements if the name is the same.
                                    if ($.isFunction(item.callback) && (typeof k.callbacks[key] === 'undefined' || typeof opt.type === 'undefined')) {
                                        k.callbacks[key] = item.callback;
                                    }
                                });
                                createNameNode(item).appendTo($t);
                                break;
                        }

                        // disable key listener in <input>
                        if (item.type && item.type !== 'sub' && item.type !== 'html' && item.type !== 'cm_seperator') {
                            $input
                                .on('focus', handle.focusInput)
                                .on('blur', handle.blurInput);

                            if (item.events) {
                                $input.on(item.events, opt);
                            }
                        }

                        // add icons
                        if (item.icon) {
                            if ($.isFunction(item.icon)) {
                                item._icon = item.icon.call(this, this, $t, key, item);
                            } else {
                                if (typeof(item.icon) === 'string' && (
                                    item.icon.substring(0, 4) === 'fab '
                                    || item.icon.substring(0, 4) === 'fas '
                                    || item.icon.substring(0, 4) === 'fad '
                                    || item.icon.substring(0, 4) === 'far '
                                    || item.icon.substring(0, 4) === 'fal ')
                                ) {
                                    // to enable font awesome
                                    $t.addClass(root.classNames.icon + ' ' + root.classNames.icon + '--fa5');
                                    item._icon = $('<i class="' + item.icon + '"></i>');
                                } else if (typeof(item.icon) === 'string' && item.icon.substring(0, 3) === 'fa-') {
                                    item._icon = root.classNames.icon + ' ' + root.classNames.icon + '--fa fa ' + item.icon;
                                } else {
                                    item._icon = root.classNames.icon + ' ' + root.classNames.icon + '-' + item.icon;
                                }
                            }

                            if(typeof(item._icon) === "string"){
                                $t.addClass(item._icon);
                            } else {
                                $t.prepend(item._icon);
                            }
                        }
                    }

                    // cache contained elements
                    item.$input = $input;
                    item.$label = $label;

                    // attach item to menu
                    $t.appendTo(opt.$menu);

                    // Disable text selection
                    if (!opt.hasTypes && $.support.eventSelectstart) {
                        // browsers support user-select: none,
                        // IE has a special event for text-selection
                        // browsers supporting neither will not be preventing text-selection
                        $t.on('selectstart.disableTextSelect', handle.abortevent);
                    }
                });
                // attach contextMenu to <body> (to bypass any possible overflow:hidden issues on parents of the trigger element)
                if (!opt.$node) {
                    opt.$menu.css('display', 'none').addClass('context-menu-root');
                }
                opt.$menu.appendTo(opt.appendTo || document.body);
            },
            resize: function ($menu, nested) {
                var domMenu;
                // determine widths of submenus, as CSS won't grow them automatically
                // position:absolute within position:absolute; min-width:100; max-width:200; results in width: 100;
                // kinda sucks hard...

                // determine width of absolutely positioned element
                $menu.css({position: 'absolute', display: 'block'});
                // don't apply yet, because that would break nested elements' widths
                $menu.data('width',
                    (domMenu = $menu.get(0)).getBoundingClientRect ?
                        Math.ceil(domMenu.getBoundingClientRect().width) :
                        $menu.outerWidth() + 1); // outerWidth() returns rounded pixels
                // reset styles so they allow nested elements to grow/shrink naturally
                $menu.css({
                    position: 'static',
                    minWidth: '0px',
                    maxWidth: '100000px'
                });
                // identify width of nested menus
                $menu.find('> li > ul').each(function () {
                    op.resize($(this), true);
                });
                // reset and apply changes in the end because nested
                // elements' widths wouldn't be calculatable otherwise
                if (!nested) {
                    $menu.find('ul').addBack().css({
                        position: '',
                        display: '',
                        minWidth: '',
                        maxWidth: ''
                    }).outerWidth(function () {
                        return $(this).data('width');
                    });
                }
            },
            update: function (opt, root) {
                var $trigger = this;
                if (typeof root === 'undefined') {
                    root = opt;
                    op.resize(opt.$menu);
                }

                var hasVisibleItems = false;

                // re-check disabled for each item
                opt.$menu.children().each(function () {
                    var $item = $(this),
                        key = $item.data('contextMenuKey'),
                        item = opt.items[key],
                        disabled = ($.isFunction(item.disabled) && item.disabled.call($trigger, key, root)) || item.disabled === true,
                        visible;
                    if ($.isFunction(item.visible)) {
                        visible = item.visible.call($trigger, key, root);
                    } else if (typeof item.visible !== 'undefined') {
                        visible = item.visible === true;
                    } else {
                        visible = true;
                    }

                    if (visible) {
                        hasVisibleItems = true;
                    }

                    $item[visible ? 'show' : 'hide']();

                    // dis- / enable item
                    $item[disabled ? 'addClass' : 'removeClass'](root.classNames.disabled);

                    if ($.isFunction(item.icon)) {
                        $item.removeClass(item._icon);
                        var iconResult = item.icon.call(this, $trigger, $item, key, item);
                        if(typeof(iconResult) === "string"){
                            $item.addClass(iconResult);
                        } else {
                            $item.prepend(iconResult);
                        }
                    }

                    if (item.type) {
                        // dis- / enable input elements
                        $item.find('input, select, textarea').prop('disabled', disabled);

                        // update input states
                        switch (item.type) {
                            case 'text':
                            case 'textarea':
                                item.$input.val(item.value || '');
                                break;

                            case 'checkbox':
                            case 'radio':
                                item.$input.val(item.value || '').prop('checked', !!item.selected);
                                break;

                            case 'select':
                                item.$input.val((item.selected === 0 ? "0" : item.selected) || '');
                                break;
                        }
                    }

                    if (item.$menu) {
                        // update sub-menu
                        var subMenuHasVisibleItems = op.update.call($trigger, item, root);
                        if (subMenuHasVisibleItems) {
                            hasVisibleItems = true;
                        }
                    }
                });
                return hasVisibleItems;
            },
            layer: function (opt, zIndex) {
                // add transparent layer for click area
                // filter and background for Internet Explorer, Issue #23
                var $layer = opt.$layer = $('<div id="context-menu-layer"></div>')
                    .css({
                        height: $win.height(),
                        width: $win.width(),
                        display: 'block',
                        position: 'fixed',
                        'z-index': zIndex - 1,
                        top: 0,
                        left: 0,
                        opacity: 0,
                        filter: 'alpha(opacity=0)',
                        'background-color': '#000'
                    })
                    .data('contextMenuRoot', opt)
                    .appendTo(document.body)
                    .on('contextmenu', handle.abortevent)
                    .on('mousedown', handle.layerClick);

                // IE6 doesn't know position:fixed;
                if (typeof document.body.style.maxWidth === 'undefined') { // IE6 doesn't support maxWidth
                    $layer.css({
                        'position': 'absolute',
                        'height': $(document).height()
                    });
                }

                return $layer;
            },
            processPromises: function (opt, root, promise) {
                // Start
                opt.$node.addClass(root.classNames.iconLoadingClass);

                function completedPromise(opt, root, items) {
                    // Completed promise (dev called promise.resolve). We now have a list of items which can
                    // be used to create the rest of the context menu.
                    if (typeof items === 'undefined') {
                        // Null result, dev should have checked
                        errorPromise(undefined);//own error object
                    }
                    finishPromiseProcess(opt, root, items);
                }

                function errorPromise(opt, root, errorItem) {
                    // User called promise.reject() with an error item, if not, provide own error item.
                    if (typeof errorItem === 'undefined') {
                        errorItem = {
                            "error": {
                                name: "No items and no error item",
                                icon: "context-menu-icon context-menu-icon-quit"
                            }
                        };
                        if (window.console) {
                            (console.error || console.log).call(console, 'When you reject a promise, provide an "items" object, equal to normal sub-menu items');
                        }
                    } else if (typeof errorItem === 'string') {
                        errorItem = {"error": {name: errorItem}};
                    }
                    finishPromiseProcess(opt, root, errorItem);
                }

                function finishPromiseProcess(opt, root, items) {
                    if (typeof root.$menu === 'undefined' || !root.$menu.is(':visible')) {
                        return;
                    }
                    opt.$node.removeClass(root.classNames.iconLoadingClass);
                    opt.items = items;
                    op.create(opt, root, true); // Create submenu
                    op.update(opt, root); // Correctly update position if user is already hovered over menu item
                    root.positionSubmenu.call(opt.$node, opt.$menu); // positionSubmenu, will only do anything if user already hovered over menu item that just got new subitems.
                }

                // Wait for promise completion. .then(success, error, notify) (we don't track notify). Bind the opt
                // and root to avoid scope problems
                promise.then(completedPromise.bind(this, opt, root), errorPromise.bind(this, opt, root));
            },
            // operation that will run after contextMenu showed on screen
            activated: function(opt){
                var $menu = opt.$menu;
                var $menuOffset = $menu.offset();
                var winHeight = $(window).height();
                var winScrollTop = $(window).scrollTop();
                var menuHeight = $menu.height();
                if(menuHeight > winHeight){
                    $menu.css({
                        'height' : winHeight + 'px',
                        'overflow-x': 'hidden',
                        'overflow-y': 'auto',
                        'top': winScrollTop + 'px'
                    });
                } else if(($menuOffset.top < winScrollTop) || ($menuOffset.top + menuHeight > winScrollTop + winHeight)){
                    $menu.css({
                        'top': winScrollTop + 'px'
                    });
                }
            }
        };

    // split accesskey according to http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#assigned-access-key
    function splitAccesskey(val) {
        var t = val.split(/\s+/);
        var keys = [];

        for (var i = 0, k; k = t[i]; i++) {
            k = k.charAt(0).toUpperCase(); // first character only
            // theoretically non-accessible characters should be ignored, but different systems, different keyboard layouts, ... screw it.
            // a map to look up already used access keys would be nice
            keys.push(k);
        }

        return keys;
    }

// handle contextMenu triggers
    $.fn.contextMenu = function (operation) {
        var $t = this, $o = operation;
        if (this.length > 0) {  // this is not a build on demand menu
            if (typeof operation === 'undefined') {
                this.first().trigger('contextmenu');
            } else if (typeof operation.x !== 'undefined' && typeof operation.y !== 'undefined') {
                this.first().trigger($.Event('contextmenu', {
                    pageX: operation.x,
                    pageY: operation.y,
                    mouseButton: operation.button
                }));
            } else if (operation === 'hide') {
                var $menu = this.first().data('contextMenu') ? this.first().data('contextMenu').$menu : null;
                if ($menu) {
                    $menu.trigger('contextmenu:hide');
                }
            } else if (operation === 'destroy') {
                $.contextMenu('destroy', {context: this});
            } else if ($.isPlainObject(operation)) {
                operation.context = this;
                $.contextMenu('create', operation);
            } else if (operation) {
                this.removeClass('context-menu-disabled');
            } else if (!operation) {
                this.addClass('context-menu-disabled');
            }
        } else {
            $.each(menus, function () {
                if (this.selector === $t.selector) {
                    $o.data = this;

                    $.extend($o.data, {trigger: 'demand'});
                }
            });

            handle.contextmenu.call($o.target, $o);
        }

        return this;
    };

    // manage contextMenu instances
    $.contextMenu = function (operation, options) {
        if (typeof operation !== 'string') {
            options = operation;
            operation = 'create';
        }

        if (typeof options === 'string') {
            options = {selector: options};
        } else if (typeof options === 'undefined') {
            options = {};
        }

        // merge with default options
        var o = $.extend(true, {}, defaults, options || {});
        var $document = $(document);
        var $context = $document;
        var _hasContext = false;

        if (!o.context || !o.context.length) {
            o.context = document;
        } else {
            // you never know what they throw at you...
            $context = $(o.context).first();
            o.context = $context.get(0);
            _hasContext = !$(o.context).is(document);
        }

        switch (operation) {

            case 'update':
                // Updates visibility and such
                if(_hasContext){
                    op.update($context);
                } else {
                    for(var menu in menus){
                        if(menus.hasOwnProperty(menu)){
                            op.update(menus[menu]);
                        }
                    }
                }
                break;

            case 'create':
                // no selector no joy
                if (!o.selector) {
                    throw new Error('No selector specified');
                }
                // make sure internal classes are not bound to
                if (o.selector.match(/.context-menu-(list|item|input)($|\s)/)) {
                    throw new Error('Cannot bind to selector "' + o.selector + '" as it contains a reserved className');
                }
                if (!o.build && (!o.items || $.isEmptyObject(o.items))) {
                    throw new Error('No Items specified');
                }
                counter++;
                o.ns = '.contextMenu' + counter;
                if (!_hasContext) {
                    namespaces[o.selector] = o.ns;
                }
                menus[o.ns] = o;

                // default to right click
                if (!o.trigger) {
                    o.trigger = 'right';
                }

                if (!initialized) {
                    var itemClick = o.itemClickEvent === 'click' ? 'click.contextMenu' : 'mouseup.contextMenu';
                    var contextMenuItemObj = {
                        // 'mouseup.contextMenu': handle.itemClick,
                        // 'click.contextMenu': handle.itemClick,
                        'contextmenu:focus.contextMenu': handle.focusItem,
                        'contextmenu:blur.contextMenu': handle.blurItem,
                        'contextmenu.contextMenu': handle.abortevent,
                        'mouseenter.contextMenu': handle.itemMouseenter,
                        'mouseleave.contextMenu': handle.itemMouseleave
                    };
                    contextMenuItemObj[itemClick] = handle.itemClick;
                    // make sure item click is registered first
                    $document
                        .on({
                            'contextmenu:hide.contextMenu': handle.hideMenu,
                            'prevcommand.contextMenu': handle.prevItem,
                            'nextcommand.contextMenu': handle.nextItem,
                            'contextmenu.contextMenu': handle.abortevent,
                            'mouseenter.contextMenu': handle.menuMouseenter,
                            'mouseleave.contextMenu': handle.menuMouseleave
                        }, '.context-menu-list')
                        .on('mouseup.contextMenu', '.context-menu-input', handle.inputClick)
                        .on(contextMenuItemObj, '.context-menu-item');

                    initialized = true;
                }

                // engage native contextmenu event
                $context
                    .on('contextmenu' + o.ns, o.selector, o, handle.contextmenu);

                if (_hasContext) {
                    // add remove hook, just in case
                    $context.on('remove' + o.ns, function () {
                        $(this).contextMenu('destroy');
                    });
                }

                switch (o.trigger) {
                    case 'hover':
                        $context
                            .on('mouseenter' + o.ns, o.selector, o, handle.mouseenter)
                            .on('mouseleave' + o.ns, o.selector, o, handle.mouseleave);
                        break;

                    case 'left':
                        $context.on('click' + o.ns, o.selector, o, handle.click);
                        break;
				    case 'touchstart':
                        $context.on('touchstart' + o.ns, o.selector, o, handle.click);
                        break;
                    /*
                     default:
                     // http://www.quirksmode.org/dom/events/contextmenu.html
                     $document
                     .on('mousedown' + o.ns, o.selector, o, handle.mousedown)
                     .on('mouseup' + o.ns, o.selector, o, handle.mouseup);
                     break;
                     */
                }

                // create menu
                if (!o.build) {
                    op.create(o);
                }
                break;

            case 'destroy':
                var $visibleMenu;
                if (_hasContext) {
                    // get proper options
                    var context = o.context;
                    $.each(menus, function (ns, o) {

                        if (!o) {
                            return true;
                        }

                        // Is this menu equest to the context called from
                        if (!$(context).is(o.selector)) {
                            return true;
                        }

                        $visibleMenu = $('.context-menu-list').filter(':visible');
                        if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is($(o.context).find(o.selector))) {
                            $visibleMenu.trigger('contextmenu:hide', {force: true});
                        }

                        try {
                            if (menus[o.ns].$menu) {
                                menus[o.ns].$menu.remove();
                            }

                            delete menus[o.ns];
                        } catch (e) {
                            menus[o.ns] = null;
                        }

                        $(o.context).off(o.ns);

                        return true;
                    });
                } else if (!o.selector) {
                    $document.off('.contextMenu .contextMenuAutoHide');
                    $.each(menus, function (ns, o) {
                        $(o.context).off(o.ns);
                    });

                    namespaces = {};
                    menus = {};
                    counter = 0;
                    initialized = false;

                    $('#context-menu-layer, .context-menu-list').remove();
                } else if (namespaces[o.selector]) {
                    $visibleMenu = $('.context-menu-list').filter(':visible');
                    if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is(o.selector)) {
                        $visibleMenu.trigger('contextmenu:hide', {force: true});
                    }

                    try {
                        if (menus[namespaces[o.selector]].$menu) {
                            menus[namespaces[o.selector]].$menu.remove();
                        }

                        delete menus[namespaces[o.selector]];
                    } catch (e) {
                        menus[namespaces[o.selector]] = null;
                    }

                    $document.off(namespaces[o.selector]);
                }
                break;

            case 'html5':
                // if <command> and <menuitem> are not handled by the browser,
                // or options was a bool true,
                // initialize $.contextMenu for them
                if ((!$.support.htmlCommand && !$.support.htmlMenuitem) || (typeof options === 'boolean' && options)) {
                    $('menu[type="context"]').each(function () {
                        if (this.id) {
                            $.contextMenu({
                                selector: '[contextmenu=' + this.id + ']',
                                items: $.contextMenu.fromMenu(this)
                            });
                        }
                    }).css('display', 'none');
                }
                break;

            default:
                throw new Error('Unknown operation "' + operation + '"');
        }

        return this;
    };

// import values into <input> commands
    $.contextMenu.setInputValues = function (opt, data) {
        if (typeof data === 'undefined') {
            data = {};
        }

        $.each(opt.inputs, function (key, item) {
            switch (item.type) {
                case 'text':
                case 'textarea':
                    item.value = data[key] || '';
                    break;

                case 'checkbox':
                    item.selected = data[key] ? true : false;
                    break;

                case 'radio':
                    item.selected = (data[item.radio] || '') === item.value;
                    break;

                case 'select':
                    item.selected = data[key] || '';
                    break;
            }
        });
    };

// export values from <input> commands
    $.contextMenu.getInputValues = function (opt, data) {
        if (typeof data === 'undefined') {
            data = {};
        }

        $.each(opt.inputs, function (key, item) {
            switch (item.type) {
                case 'text':
                case 'textarea':
                case 'select':
                    data[key] = item.$input.val();
                    break;

                case 'checkbox':
                    data[key] = item.$input.prop('checked');
                    break;

                case 'radio':
                    if (item.$input.prop('checked')) {
                        data[item.radio] = item.value;
                    }
                    break;
            }
        });

        return data;
    };

// find <label for="xyz">
    function inputLabel(node) {
        return (node.id && $('label[for="' + node.id + '"]').val()) || node.name;
    }

// convert <menu> to items object
    function menuChildren(items, $children, counter) {
        if (!counter) {
            counter = 0;
        }

        $children.each(function () {
            var $node = $(this),
                node = this,
                nodeName = this.nodeName.toLowerCase(),
                label,
                item;

            // extract <label><input>
            if (nodeName === 'label' && $node.find('input, textarea, select').length) {
                label = $node.text();
                $node = $node.children().first();
                node = $node.get(0);
                nodeName = node.nodeName.toLowerCase();
            }

            /*
             * <menu> accepts flow-content as children. that means <embed>, <canvas> and such are valid menu items.
             * Not being the sadistic kind, $.contextMenu only accepts:
             * <command>, <menuitem>, <hr>, <span>, <p> <input [text, radio, checkbox]>, <textarea>, <select> and of course <menu>.
             * Everything else will be imported as an html node, which is not interfaced with contextMenu.
             */

            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#concept-command
            switch (nodeName) {
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#the-menu-element
                case 'menu':
                    item = {name: $node.attr('label'), items: {}};
                    counter = menuChildren(item.items, $node.children(), counter);
                    break;

                // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-a-element-to-define-a-command
                case 'a':
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-button-element-to-define-a-command
                case 'button':
                    item = {
                        name: $node.text(),
                        disabled: !!$node.attr('disabled'),
                        callback: (function () {
                            return function () {
                                $node.get(0).click();
                            };
                        })()
                    };
                    break;

                // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-command-element-to-define-a-command
                case 'menuitem':
                case 'command':
                    switch ($node.attr('type')) {
                        case undefined:
                        case 'command':
                        case 'menuitem':
                            item = {
                                name: $node.attr('label'),
                                disabled: !!$node.attr('disabled'),
                                icon: $node.attr('icon'),
                                callback: (function () {
                                    return function () {
                                        $node.get(0).click();
                                    };
                                })()
                            };
                            break;

                        case 'checkbox':
                            item = {
                                type: 'checkbox',
                                disabled: !!$node.attr('disabled'),
                                name: $node.attr('label'),
                                selected: !!$node.attr('checked')
                            };
                            break;
                        case 'radio':
                            item = {
                                type: 'radio',
                                disabled: !!$node.attr('disabled'),
                                name: $node.attr('label'),
                                radio: $node.attr('radiogroup'),
                                value: $node.attr('id'),
                                selected: !!$node.attr('checked')
                            };
                            break;

                        default:
                            item = undefined;
                    }
                    break;

                case 'hr':
                    item = '-------';
                    break;

                case 'input':
                    switch ($node.attr('type')) {
                        case 'text':
                            item = {
                                type: 'text',
                                name: label || inputLabel(node),
                                disabled: !!$node.attr('disabled'),
                                value: $node.val()
                            };
                            break;

                        case 'checkbox':
                            item = {
                                type: 'checkbox',
                                name: label || inputLabel(node),
                                disabled: !!$node.attr('disabled'),
                                selected: !!$node.attr('checked')
                            };
                            break;

                        case 'radio':
                            item = {
                                type: 'radio',
                                name: label || inputLabel(node),
                                disabled: !!$node.attr('disabled'),
                                radio: !!$node.attr('name'),
                                value: $node.val(),
                                selected: !!$node.attr('checked')
                            };
                            break;

                        default:
                            item = undefined;
                            break;
                    }
                    break;

                case 'select':
                    item = {
                        type: 'select',
                        name: label || inputLabel(node),
                        disabled: !!$node.attr('disabled'),
                        selected: $node.val(),
                        options: {}
                    };
                    $node.children().each(function () {
                        item.options[this.value] = $(this).text();
                    });
                    break;

                case 'textarea':
                    item = {
                        type: 'textarea',
                        name: label || inputLabel(node),
                        disabled: !!$node.attr('disabled'),
                        value: $node.val()
                    };
                    break;

                case 'label':
                    break;

                default:
                    item = {type: 'html', html: $node.clone(true)};
                    break;
            }

            if (item) {
                counter++;
                items['key' + counter] = item;
            }
        });

        return counter;
    }

// convert html5 menu
    $.contextMenu.fromMenu = function (element) {
        var $this = $(element),
            items = {};

        menuChildren(items, $this.children());

        return items;
    };

// make defaults accessible
    $.contextMenu.defaults = defaults;
    $.contextMenu.types = types;
// export internal functions - undocumented, for hacking only!
    $.contextMenu.handle = handle;
    $.contextMenu.op = op;
    $.contextMenu.menus = menus;
});


/***/ }),

/***/ "./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css":
/*!*************************************************************************!*\
  !*** ./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../css-loader/dist/cjs.js!./jquery.contextMenu.min.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/button.css":
/*!*******************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/button.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../css-loader/dist/cjs.js!./button.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/button.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/core.css":
/*!*****************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/core.css ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../css-loader/dist/cjs.js!./core.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/core.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/dialog.css":
/*!*******************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/dialog.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../css-loader/dist/cjs.js!./dialog.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/dialog.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/images/ui-icons_444444_256x240.png":
/*!*******************************************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/images/ui-icons_444444_256x240.png ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "2bf13b17d09412f118b0d2191a04af9d.png");

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/images/ui-icons_555555_256x240.png":
/*!*******************************************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/images/ui-icons_555555_256x240.png ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "d184ebcfe5b609497d9df1e36d321619.png");

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/images/ui-icons_777620_256x240.png":
/*!*******************************************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/images/ui-icons_777620_256x240.png ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "8003dc8ce47dd77bd0187ce80345024b.png");

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/images/ui-icons_777777_256x240.png":
/*!*******************************************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/images/ui-icons_777777_256x240.png ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "961d67294deccae7cc75078cc91ea876.png");

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/images/ui-icons_cc0000_256x240.png":
/*!*******************************************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/images/ui-icons_cc0000_256x240.png ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "0085819bbded1954c054280cb41790d0.png");

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/images/ui-icons_ffffff_256x240.png":
/*!*******************************************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/images/ui-icons_ffffff_256x240.png ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "74e9fe3d9ced3f6712fe8e987b109292.png");

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/resizable.css":
/*!**********************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/resizable.css ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../css-loader/dist/cjs.js!./resizable.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/resizable.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/tabs.css":
/*!*****************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/tabs.css ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../css-loader/dist/cjs.js!./tabs.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/tabs.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./node_modules/jquery-ui/themes/base/theme.css":
/*!******************************************************!*\
  !*** ./node_modules/jquery-ui/themes/base/theme.css ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../css-loader/dist/cjs.js!./theme.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/jquery-ui/themes/base/theme.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "./node_modules/jquery-ui/ui/data.js":
/*!*******************************************!*\
  !*** ./node_modules/jquery-ui/ui/data.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI :data 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :data Selector
//>>group: Core
//>>description: Selects elements which have data stored under the specified key.
//>>docs: http://api.jqueryui.com/data-selector/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {
return $.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo( function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		} ) :

		// Support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		}
} );
} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/disable-selection.js":
/*!********************************************************!*\
  !*** ./node_modules/jquery-ui/ui/disable-selection.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Disable Selection 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: disableSelection
//>>group: Core
//>>description: Disable selection of text content within the set of matched elements.
//>>docs: http://api.jqueryui.com/disableSelection/

// This file is deprecated
( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

return $.fn.extend( {
	disableSelection: ( function() {
		var eventType = "onselectstart" in document.createElement( "div" ) ?
			"selectstart" :
			"mousedown";

		return function() {
			return this.on( eventType + ".ui-disableSelection", function( event ) {
				event.preventDefault();
			} );
		};
	} )(),

	enableSelection: function() {
		return this.off( ".ui-disableSelection" );
	}
} );

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/escape-selector.js":
/*!******************************************************!*\
  !*** ./node_modules/jquery-ui/ui/escape-selector.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

// Internal use only
return $.ui.escapeSelector = ( function() {
	var selectorEscape = /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;
	return function( selector ) {
		return selector.replace( selectorEscape, "\\$1" );
	};
} )();

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/focusable.js":
/*!************************************************!*\
  !*** ./node_modules/jquery-ui/ui/focusable.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Focusable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :focusable Selector
//>>group: Core
//>>description: Selects elements which can be focused.
//>>docs: http://api.jqueryui.com/focusable-selector/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

// Selectors
$.ui.focusable = function( element, hasTabindex ) {
	var map, mapName, img, focusableIfVisible, fieldset,
		nodeName = element.nodeName.toLowerCase();

	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap='#" + mapName + "']" );
		return img.length > 0 && img.is( ":visible" );
	}

	if ( /^(input|select|textarea|button|object)$/.test( nodeName ) ) {
		focusableIfVisible = !element.disabled;

		if ( focusableIfVisible ) {

			// Form controls within a disabled fieldset are disabled.
			// However, controls within the fieldset's legend do not get disabled.
			// Since controls generally aren't placed inside legends, we skip
			// this portion of the check.
			fieldset = $( element ).closest( "fieldset" )[ 0 ];
			if ( fieldset ) {
				focusableIfVisible = !fieldset.disabled;
			}
		}
	} else if ( "a" === nodeName ) {
		focusableIfVisible = element.href || hasTabindex;
	} else {
		focusableIfVisible = hasTabindex;
	}

	return focusableIfVisible && $( element ).is( ":visible" ) && visible( $( element ) );
};

// Support: IE 8 only
// IE 8 doesn't resolve inherit to visible/hidden for computed values
function visible( element ) {
	var visibility = element.css( "visibility" );
	while ( visibility === "inherit" ) {
		element = element.parent();
		visibility = element.css( "visibility" );
	}
	return visibility !== "hidden";
}

$.extend( $.expr[ ":" ], {
	focusable: function( element ) {
		return $.ui.focusable( element, $.attr( element, "tabindex" ) != null );
	}
} );

return $.ui.focusable;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/form-reset-mixin.js":
/*!*******************************************************!*\
  !*** ./node_modules/jquery-ui/ui/form-reset-mixin.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Form Reset Mixin 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Form Reset Mixin
//>>group: Core
//>>description: Refresh input widgets when their form is reset
//>>docs: http://api.jqueryui.com/form-reset-mixin/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ./form */ "./node_modules/jquery-ui/ui/form.js"),
			__webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

return $.ui.formResetMixin = {
	_formResetHandler: function() {
		var form = $( this );

		// Wait for the form reset to actually happen before refreshing
		setTimeout( function() {
			var instances = form.data( "ui-form-reset-instances" );
			$.each( instances, function() {
				this.refresh();
			} );
		} );
	},

	_bindFormResetHandler: function() {
		this.form = this.element.form();
		if ( !this.form.length ) {
			return;
		}

		var instances = this.form.data( "ui-form-reset-instances" ) || [];
		if ( !instances.length ) {

			// We don't use _on() here because we use a single event handler per form
			this.form.on( "reset.ui-form-reset", this._formResetHandler );
		}
		instances.push( this );
		this.form.data( "ui-form-reset-instances", instances );
	},

	_unbindFormResetHandler: function() {
		if ( !this.form.length ) {
			return;
		}

		var instances = this.form.data( "ui-form-reset-instances" );
		instances.splice( $.inArray( this, instances ), 1 );
		if ( instances.length ) {
			this.form.data( "ui-form-reset-instances", instances );
		} else {
			this.form
				.removeData( "ui-form-reset-instances" )
				.off( "reset.ui-form-reset" );
		}
	}
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/form.js":
/*!*******************************************!*\
  !*** ./node_modules/jquery-ui/ui/form.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

// Support: IE8 Only
// IE8 does not support the form attribute and when it is supplied. It overwrites the form prop
// with a string, so we need to find the proper form.
return $.fn.form = function() {
	return typeof this[ 0 ].form === "string" ? this.closest( "form" ) : $( this[ 0 ].form );
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/ie.js":
/*!*****************************************!*\
  !*** ./node_modules/jquery-ui/ui/ie.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

// This file is deprecated
return $.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );
} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/keycode.js":
/*!**********************************************!*\
  !*** ./node_modules/jquery-ui/ui/keycode.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {
return $.ui.keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/labels.js":
/*!*********************************************!*\
  !*** ./node_modules/jquery-ui/ui/labels.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Labels 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: labels
//>>group: Core
//>>description: Find all the labels associated with a given input
//>>docs: http://api.jqueryui.com/labels/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js"), __webpack_require__(/*! ./escape-selector */ "./node_modules/jquery-ui/ui/escape-selector.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

return $.fn.labels = function() {
	var ancestor, selector, id, labels, ancestors;

	// Check control.labels first
	if ( this[ 0 ].labels && this[ 0 ].labels.length ) {
		return this.pushStack( this[ 0 ].labels );
	}

	// Support: IE <= 11, FF <= 37, Android <= 2.3 only
	// Above browsers do not support control.labels. Everything below is to support them
	// as well as document fragments. control.labels does not work on document fragments
	labels = this.eq( 0 ).parents( "label" );

	// Look for the label based on the id
	id = this.attr( "id" );
	if ( id ) {

		// We don't search against the document in case the element
		// is disconnected from the DOM
		ancestor = this.eq( 0 ).parents().last();

		// Get a full set of top level ancestors
		ancestors = ancestor.add( ancestor.length ? ancestor.siblings() : this.siblings() );

		// Create a selector for the label based on the id
		selector = "label[for='" + $.ui.escapeSelector( id ) + "']";

		labels = labels.add( ancestors.find( selector ).addBack( selector ) );

	}

	// Return whatever we have found for labels
	return this.pushStack( labels );
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/plugin.js":
/*!*********************************************!*\
  !*** ./node_modules/jquery-ui/ui/plugin.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
return $.ui.plugin = {
	add: function( module, option, set ) {
		var i,
			proto = $.ui[ module ].prototype;
		for ( i in set ) {
			proto.plugins[ i ] = proto.plugins[ i ] || [];
			proto.plugins[ i ].push( [ option, set[ i ] ] );
		}
	},
	call: function( instance, name, args, allowDisconnected ) {
		var i,
			set = instance.plugins[ name ];

		if ( !set ) {
			return;
		}

		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode ||
				instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
			return;
		}

		for ( i = 0; i < set.length; i++ ) {
			if ( instance.options[ set[ i ][ 0 ] ] ) {
				set[ i ][ 1 ].apply( instance.element, args );
			}
		}
	}
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/position.js":
/*!***********************************************!*\
  !*** ./node_modules/jquery-ui/ui/position.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Position 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {
( function() {
var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[ 0 ];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div " +
				"style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
				"<div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[ 0 ];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[ 0 ].clientWidth;
		}

		div.remove();

		return ( cachedScrollbarWidth = w1 - w2 );
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[ 0 ] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
			hasOffset = !isWindow && !isDocument;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.outerWidth(),
			height: withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// Make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[ 0 ].preventDefault ) {

		// Force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;

	// Clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// Force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1 ) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// Calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// Reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	} );

	// Normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each( function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
				scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
				scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				} );
			}
		} );

		if ( options.using ) {

			// Adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	} );
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// Element is wider than within
			if ( data.collisionWidth > outerWidth ) {

				// Element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
						withinOffset;
					position.left += overLeft - newOverRight;

				// Element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;

				// Element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}

			// Too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;

			// Too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;

			// Adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// Element is taller than within
			if ( data.collisionHeight > outerHeight ) {

				// Element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
						withinOffset;
					position.top += overTop - newOverBottom;

				// Element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;

				// Element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}

			// Too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;

			// Too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;

			// Adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
					outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
					atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
					outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
					offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

} )();

return $.ui.position;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/safe-active-element.js":
/*!**********************************************************!*\
  !*** ./node_modules/jquery-ui/ui/safe-active-element.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {
return $.ui.safeActiveElement = function( document ) {
	var activeElement;

	// Support: IE 9 only
	// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
	try {
		activeElement = document.activeElement;
	} catch ( error ) {
		activeElement = document.body;
	}

	// Support: IE 9 - 11 only
	// IE may return null instead of an element
	// Interestingly, this only seems to occur when NOT in an iframe
	if ( !activeElement ) {
		activeElement = document.body;
	}

	// Support: IE 11 only
	// IE11 returns a seemingly empty object in some cases when accessing
	// document.activeElement from an <iframe>
	if ( !activeElement.nodeName ) {
		activeElement = document.body;
	}

	return activeElement;
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/safe-blur.js":
/*!************************************************!*\
  !*** ./node_modules/jquery-ui/ui/safe-blur.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {
return $.ui.safeBlur = function( element ) {

	// Support: IE9 - 10 only
	// If the <body> is blurred, IE will switch windows, see #9420
	if ( element && element.nodeName.toLowerCase() !== "body" ) {
		$( element ).trigger( "blur" );
	}
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/scroll-parent.js":
/*!****************************************************!*\
  !*** ./node_modules/jquery-ui/ui/scroll-parent.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Scroll Parent 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: scrollParent
//>>group: Core
//>>description: Get the closest ancestor element that is scrollable.
//>>docs: http://api.jqueryui.com/scrollParent/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

return $.fn.scrollParent = function( includeHidden ) {
	var position = this.css( "position" ),
		excludeStaticParent = position === "absolute",
		overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
		scrollParent = this.parents().filter( function() {
			var parent = $( this );
			if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
				return false;
			}
			return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
				parent.css( "overflow-x" ) );
		} ).eq( 0 );

	return position === "fixed" || !scrollParent.length ?
		$( this[ 0 ].ownerDocument || document ) :
		scrollParent;
};

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/tabbable.js":
/*!***********************************************!*\
  !*** ./node_modules/jquery-ui/ui/tabbable.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Tabbable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :tabbable Selector
//>>group: Core
//>>description: Selects elements which can be tabbed to.
//>>docs: http://api.jqueryui.com/tabbable-selector/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js"), __webpack_require__(/*! ./focusable */ "./node_modules/jquery-ui/ui/focusable.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

return $.extend( $.expr[ ":" ], {
	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			hasTabindex = tabIndex != null;
		return ( !hasTabindex || tabIndex >= 0 ) && $.ui.focusable( element, hasTabindex );
	}
} );

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/unique-id.js":
/*!************************************************!*\
  !*** ./node_modules/jquery-ui/ui/unique-id.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Unique ID 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: uniqueId
//>>group: Core
//>>description: Functions to generate and remove uniqueId's
//>>docs: http://api.jqueryui.com/uniqueId/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

return $.fn.extend( {
	uniqueId: ( function() {
		var uuid = 0;

		return function() {
			return this.each( function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			} );
		};
	} )(),

	removeUniqueId: function() {
		return this.each( function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		} );
	}
} );

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/version.js":
/*!**********************************************!*\
  !*** ./node_modules/jquery-ui/ui/version.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
} ( function( $ ) {

$.ui = $.ui || {};

return $.ui.version = "1.12.1";

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widget.js":
/*!*********************************************!*\
  !*** ./node_modules/jquery-ui/ui/widget.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Widget 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"), __webpack_require__(/*! ./version */ "./node_modules/jquery-ui/ui/version.js") ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

var widgetUuid = 0;
var widgetSlice = Array.prototype.slice;

$.cleanData = ( function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// Http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
} )( $.cleanData );

$.widget = function( name, base, prototype ) {
	var existingConstructor, constructor, basePrototype;

	// ProxiedPrototype allows the provided prototype to remain unmodified
	// so that it can be used as a mixin for multiple widgets (#8876)
	var proxiedPrototype = {};

	var namespace = name.split( "." )[ 0 ];
	name = name.split( "." )[ 1 ];
	var fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	if ( $.isArray( prototype ) ) {
		prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
	}

	// Create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {

		// Allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// Allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	// Extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,

		// Copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),

		// Track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	} );

	basePrototype = new base();

	// We need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = ( function() {
			function _super() {
				return base.prototype[ prop ].apply( this, arguments );
			}

			function _superApply( args ) {
				return base.prototype[ prop ].apply( this, args );
			}

			return function() {
				var __super = this._super;
				var __superApply = this._superApply;
				var returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		} )();
	} );
	constructor.prototype = $.widget.extend( basePrototype, {

		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	} );

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// Redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
				child._proto );
		} );

		// Remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widgetSlice.call( arguments, 1 );
	var inputIndex = 0;
	var inputLength = input.length;
	var key;
	var value;

	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :

						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );

				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string";
		var args = widgetSlice.call( arguments, 1 );
		var returnValue = this;

		if ( isMethodCall ) {

			// If this is an empty collection, we need to have the instance method
			// return undefined instead of the jQuery instance
			if ( !this.length && options === "instance" ) {
				returnValue = undefined;
			} else {
				this.each( function() {
					var methodValue;
					var instance = $.data( this, fullName );

					if ( options === "instance" ) {
						returnValue = instance;
						return false;
					}

					if ( !instance ) {
						return $.error( "cannot call methods on " + name +
							" prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}

					if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name +
							" widget instance" );
					}

					methodValue = instance[ options ].apply( instance, args );

					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				} );
			}
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat( args ) );
			}

			this.each( function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			} );
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",

	options: {
		classes: {},
		disabled: false,

		// Callbacks
		create: null
	},

	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widgetUuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		this.classesElementLookup = {};

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			} );
			this.document = $( element.style ?

				// Element within the document
				element.ownerDocument :

				// Element is window or document
				element.document || element );
			this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();

		if ( this.options.disabled ) {
			this._setOptionDisabled( this.options.disabled );
		}

		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},

	_getCreateOptions: function() {
		return {};
	},

	_getCreateEventData: $.noop,

	_create: $.noop,

	_init: $.noop,

	destroy: function() {
		var that = this;

		this._destroy();
		$.each( this.classesElementLookup, function( key, value ) {
			that._removeClass( value, key );
		} );

		// We can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.off( this.eventNamespace )
			.removeData( this.widgetFullName );
		this.widget()
			.off( this.eventNamespace )
			.removeAttr( "aria-disabled" );

		// Clean up events and states
		this.bindings.off( this.eventNamespace );
	},

	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;
		var parts;
		var curOption;
		var i;

		if ( arguments.length === 0 ) {

			// Don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {

			// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},

	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "classes" ) {
			this._setOptionClasses( value );
		}

		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this._setOptionDisabled( value );
		}

		return this;
	},

	_setOptionClasses: function( value ) {
		var classKey, elements, currentElements;

		for ( classKey in value ) {
			currentElements = this.classesElementLookup[ classKey ];
			if ( value[ classKey ] === this.options.classes[ classKey ] ||
					!currentElements ||
					!currentElements.length ) {
				continue;
			}

			// We are doing this to create a new jQuery object because the _removeClass() call
			// on the next line is going to destroy the reference to the current elements being
			// tracked. We need to save a copy of this collection so that we can add the new classes
			// below.
			elements = $( currentElements.get() );
			this._removeClass( currentElements, classKey );

			// We don't use _addClass() here, because that uses this.options.classes
			// for generating the string of classes. We want to use the value passed in from
			// _setOption(), this is the new value of the classes option which was passed to
			// _setOption(). We pass this value directly to _classes().
			elements.addClass( this._classes( {
				element: elements,
				keys: classKey,
				classes: value,
				add: true
			} ) );
		}
	},

	_setOptionDisabled: function( value ) {
		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

		// If the widget is becoming disabled, then nothing is interactive
		if ( value ) {
			this._removeClass( this.hoverable, null, "ui-state-hover" );
			this._removeClass( this.focusable, null, "ui-state-focus" );
		}
	},

	enable: function() {
		return this._setOptions( { disabled: false } );
	},

	disable: function() {
		return this._setOptions( { disabled: true } );
	},

	_classes: function( options ) {
		var full = [];
		var that = this;

		options = $.extend( {
			element: this.element,
			classes: this.options.classes || {}
		}, options );

		function processClassString( classes, checkOption ) {
			var current, i;
			for ( i = 0; i < classes.length; i++ ) {
				current = that.classesElementLookup[ classes[ i ] ] || $();
				if ( options.add ) {
					current = $( $.unique( current.get().concat( options.element.get() ) ) );
				} else {
					current = $( current.not( options.element ).get() );
				}
				that.classesElementLookup[ classes[ i ] ] = current;
				full.push( classes[ i ] );
				if ( checkOption && options.classes[ classes[ i ] ] ) {
					full.push( options.classes[ classes[ i ] ] );
				}
			}
		}

		this._on( options.element, {
			"remove": "_untrackClassesElement"
		} );

		if ( options.keys ) {
			processClassString( options.keys.match( /\S+/g ) || [], true );
		}
		if ( options.extra ) {
			processClassString( options.extra.match( /\S+/g ) || [] );
		}

		return full.join( " " );
	},

	_untrackClassesElement: function( event ) {
		var that = this;
		$.each( that.classesElementLookup, function( key, value ) {
			if ( $.inArray( event.target, value ) !== -1 ) {
				that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
			}
		} );
	},

	_removeClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, false );
	},

	_addClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, true );
	},

	_toggleClass: function( element, keys, extra, add ) {
		add = ( typeof add === "boolean" ) ? add : extra;
		var shift = ( typeof element === "string" || element === null ),
			options = {
				extra: shift ? keys : extra,
				keys: shift ? element : keys,
				element: shift ? this.element : element,
				add: add
			};
		options.element.toggleClass( this._classes( options ), add );
		return this;
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement;
		var instance = this;

		// No suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// No element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {

				// Allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// Copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ );
			var eventName = match[ 1 ] + instance.eventNamespace;
			var selector = match[ 2 ];

			if ( selector ) {
				delegateElement.on( eventName, selector, handlerProxy );
			} else {
				element.on( eventName, handlerProxy );
			}
		} );
	},

	_off: function( element, eventName ) {
		eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.off( eventName ).off( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
			},
			mouseleave: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
			}
		} );
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
			},
			focusout: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
			}
		} );
	},

	_trigger: function( type, event, data ) {
		var prop, orig;
		var callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();

		// The original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// Copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}

		var hasOptions;
		var effectName = !options ?
			method :
			options === true || typeof options === "number" ?
				defaultEffect :
				options.effect || defaultEffect;

		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}

		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;

		if ( options.delay ) {
			element.delay( options.delay );
		}

		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue( function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			} );
		}
	};
} );

return $.widget;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/button.js":
/*!*****************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/button.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Button 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Button
//>>group: Widgets
//>>description: Enhances a form with themeable buttons.
//>>docs: http://api.jqueryui.com/button/
//>>demos: http://jqueryui.com/button/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/button.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),

			// These are only for backcompat
			// TODO: Remove after 1.12
			__webpack_require__(/*! ./controlgroup */ "./node_modules/jquery-ui/ui/widgets/controlgroup.js"),
			__webpack_require__(/*! ./checkboxradio */ "./node_modules/jquery-ui/ui/widgets/checkboxradio.js"),

			__webpack_require__(/*! ../keycode */ "./node_modules/jquery-ui/ui/keycode.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

$.widget( "ui.button", {
	version: "1.12.1",
	defaultElement: "<button>",
	options: {
		classes: {
			"ui-button": "ui-corner-all"
		},
		disabled: null,
		icon: null,
		iconPosition: "beginning",
		label: null,
		showLabel: true
	},

	_getCreateOptions: function() {
		var disabled,

			// This is to support cases like in jQuery Mobile where the base widget does have
			// an implementation of _getCreateOptions
			options = this._super() || {};

		this.isInput = this.element.is( "input" );

		disabled = this.element[ 0 ].disabled;
		if ( disabled != null ) {
			options.disabled = disabled;
		}

		this.originalLabel = this.isInput ? this.element.val() : this.element.html();
		if ( this.originalLabel ) {
			options.label = this.originalLabel;
		}

		return options;
	},

	_create: function() {
		if ( !this.option.showLabel & !this.options.icon ) {
			this.options.showLabel = true;
		}

		// We have to check the option again here even though we did in _getCreateOptions,
		// because null may have been passed on init which would override what was set in
		// _getCreateOptions
		if ( this.options.disabled == null ) {
			this.options.disabled = this.element[ 0 ].disabled || false;
		}

		this.hasTitle = !!this.element.attr( "title" );

		// Check to see if the label needs to be set or if its already correct
		if ( this.options.label && this.options.label !== this.originalLabel ) {
			if ( this.isInput ) {
				this.element.val( this.options.label );
			} else {
				this.element.html( this.options.label );
			}
		}
		this._addClass( "ui-button", "ui-widget" );
		this._setOption( "disabled", this.options.disabled );
		this._enhance();

		if ( this.element.is( "a" ) ) {
			this._on( {
				"keyup": function( event ) {
					if ( event.keyCode === $.ui.keyCode.SPACE ) {
						event.preventDefault();

						// Support: PhantomJS <= 1.9, IE 8 Only
						// If a native click is available use it so we actually cause navigation
						// otherwise just trigger a click event
						if ( this.element[ 0 ].click ) {
							this.element[ 0 ].click();
						} else {
							this.element.trigger( "click" );
						}
					}
				}
			} );
		}
	},

	_enhance: function() {
		if ( !this.element.is( "button" ) ) {
			this.element.attr( "role", "button" );
		}

		if ( this.options.icon ) {
			this._updateIcon( "icon", this.options.icon );
			this._updateTooltip();
		}
	},

	_updateTooltip: function() {
		this.title = this.element.attr( "title" );

		if ( !this.options.showLabel && !this.title ) {
			this.element.attr( "title", this.options.label );
		}
	},

	_updateIcon: function( option, value ) {
		var icon = option !== "iconPosition",
			position = icon ? this.options.iconPosition : value,
			displayBlock = position === "top" || position === "bottom";

		// Create icon
		if ( !this.icon ) {
			this.icon = $( "<span>" );

			this._addClass( this.icon, "ui-button-icon", "ui-icon" );

			if ( !this.options.showLabel ) {
				this._addClass( "ui-button-icon-only" );
			}
		} else if ( icon ) {

			// If we are updating the icon remove the old icon class
			this._removeClass( this.icon, null, this.options.icon );
		}

		// If we are updating the icon add the new icon class
		if ( icon ) {
			this._addClass( this.icon, null, value );
		}

		this._attachIcon( position );

		// If the icon is on top or bottom we need to add the ui-widget-icon-block class and remove
		// the iconSpace if there is one.
		if ( displayBlock ) {
			this._addClass( this.icon, null, "ui-widget-icon-block" );
			if ( this.iconSpace ) {
				this.iconSpace.remove();
			}
		} else {

			// Position is beginning or end so remove the ui-widget-icon-block class and add the
			// space if it does not exist
			if ( !this.iconSpace ) {
				this.iconSpace = $( "<span> </span>" );
				this._addClass( this.iconSpace, "ui-button-icon-space" );
			}
			this._removeClass( this.icon, null, "ui-wiget-icon-block" );
			this._attachIconSpace( position );
		}
	},

	_destroy: function() {
		this.element.removeAttr( "role" );

		if ( this.icon ) {
			this.icon.remove();
		}
		if ( this.iconSpace ) {
			this.iconSpace.remove();
		}
		if ( !this.hasTitle ) {
			this.element.removeAttr( "title" );
		}
	},

	_attachIconSpace: function( iconPosition ) {
		this.icon[ /^(?:end|bottom)/.test( iconPosition ) ? "before" : "after" ]( this.iconSpace );
	},

	_attachIcon: function( iconPosition ) {
		this.element[ /^(?:end|bottom)/.test( iconPosition ) ? "append" : "prepend" ]( this.icon );
	},

	_setOptions: function( options ) {
		var newShowLabel = options.showLabel === undefined ?
				this.options.showLabel :
				options.showLabel,
			newIcon = options.icon === undefined ? this.options.icon : options.icon;

		if ( !newShowLabel && !newIcon ) {
			options.showLabel = true;
		}
		this._super( options );
	},

	_setOption: function( key, value ) {
		if ( key === "icon" ) {
			if ( value ) {
				this._updateIcon( key, value );
			} else if ( this.icon ) {
				this.icon.remove();
				if ( this.iconSpace ) {
					this.iconSpace.remove();
				}
			}
		}

		if ( key === "iconPosition" ) {
			this._updateIcon( key, value );
		}

		// Make sure we can't end up with a button that has neither text nor icon
		if ( key === "showLabel" ) {
				this._toggleClass( "ui-button-icon-only", null, !value );
				this._updateTooltip();
		}

		if ( key === "label" ) {
			if ( this.isInput ) {
				this.element.val( value );
			} else {

				// If there is an icon, append it, else nothing then append the value
				// this avoids removal of the icon when setting label text
				this.element.html( value );
				if ( this.icon ) {
					this._attachIcon( this.options.iconPosition );
					this._attachIconSpace( this.options.iconPosition );
				}
			}
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this._toggleClass( null, "ui-state-disabled", value );
			this.element[ 0 ].disabled = value;
			if ( value ) {
				this.element.blur();
			}
		}
	},

	refresh: function() {

		// Make sure to only check disabled if its an element that supports this otherwise
		// check for the disabled class to determine state
		var isDisabled = this.element.is( "input, button" ) ?
			this.element[ 0 ].disabled : this.element.hasClass( "ui-button-disabled" );

		if ( isDisabled !== this.options.disabled ) {
			this._setOptions( { disabled: isDisabled } );
		}

		this._updateTooltip();
	}
} );

// DEPRECATED
if ( $.uiBackCompat !== false ) {

	// Text and Icons options
	$.widget( "ui.button", $.ui.button, {
		options: {
			text: true,
			icons: {
				primary: null,
				secondary: null
			}
		},

		_create: function() {
			if ( this.options.showLabel && !this.options.text ) {
				this.options.showLabel = this.options.text;
			}
			if ( !this.options.showLabel && this.options.text ) {
				this.options.text = this.options.showLabel;
			}
			if ( !this.options.icon && ( this.options.icons.primary ||
					this.options.icons.secondary ) ) {
				if ( this.options.icons.primary ) {
					this.options.icon = this.options.icons.primary;
				} else {
					this.options.icon = this.options.icons.secondary;
					this.options.iconPosition = "end";
				}
			} else if ( this.options.icon ) {
				this.options.icons.primary = this.options.icon;
			}
			this._super();
		},

		_setOption: function( key, value ) {
			if ( key === "text" ) {
				this._super( "showLabel", value );
				return;
			}
			if ( key === "showLabel" ) {
				this.options.text = value;
			}
			if ( key === "icon" ) {
				this.options.icons.primary = value;
			}
			if ( key === "icons" ) {
				if ( value.primary ) {
					this._super( "icon", value.primary );
					this._super( "iconPosition", "beginning" );
				} else if ( value.secondary ) {
					this._super( "icon", value.secondary );
					this._super( "iconPosition", "end" );
				}
			}
			this._superApply( arguments );
		}
	} );

	$.fn.button = ( function( orig ) {
		return function() {
			if ( !this.length || ( this.length && this[ 0 ].tagName !== "INPUT" ) ||
					( this.length && this[ 0 ].tagName === "INPUT" && (
						this.attr( "type" ) !== "checkbox" && this.attr( "type" ) !== "radio"
					) ) ) {
				return orig.apply( this, arguments );
			}
			if ( !$.ui.checkboxradio ) {
				$.error( "Checkboxradio widget missing" );
			}
			if ( arguments.length === 0 ) {
				return this.checkboxradio( {
					"icon": false
				} );
			}
			return this.checkboxradio.apply( this, arguments );
		};
	} )( $.fn.button );

	$.fn.buttonset = function() {
		if ( !$.ui.controlgroup ) {
			$.error( "Controlgroup widget missing" );
		}
		if ( arguments[ 0 ] === "option" && arguments[ 1 ] === "items" && arguments[ 2 ] ) {
			return this.controlgroup.apply( this,
				[ arguments[ 0 ], "items.button", arguments[ 2 ] ] );
		}
		if ( arguments[ 0 ] === "option" && arguments[ 1 ] === "items" ) {
			return this.controlgroup.apply( this, [ arguments[ 0 ], "items.button" ] );
		}
		if ( typeof arguments[ 0 ] === "object" && arguments[ 0 ].items ) {
			arguments[ 0 ].items = {
				button: arguments[ 0 ].items
			};
		}
		return this.controlgroup.apply( this, arguments );
	};
}

return $.ui.button;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/checkboxradio.js":
/*!************************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/checkboxradio.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Checkboxradio 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Checkboxradio
//>>group: Widgets
//>>description: Enhances a form with multiple themeable checkboxes or radio buttons.
//>>docs: http://api.jqueryui.com/checkboxradio/
//>>demos: http://jqueryui.com/checkboxradio/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/button.css
//>>css.structure: ../../themes/base/checkboxradio.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ../escape-selector */ "./node_modules/jquery-ui/ui/escape-selector.js"),
			__webpack_require__(/*! ../form-reset-mixin */ "./node_modules/jquery-ui/ui/form-reset-mixin.js"),
			__webpack_require__(/*! ../labels */ "./node_modules/jquery-ui/ui/labels.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

$.widget( "ui.checkboxradio", [ $.ui.formResetMixin, {
	version: "1.12.1",
	options: {
		disabled: null,
		label: null,
		icon: true,
		classes: {
			"ui-checkboxradio-label": "ui-corner-all",
			"ui-checkboxradio-icon": "ui-corner-all"
		}
	},

	_getCreateOptions: function() {
		var disabled, labels;
		var that = this;
		var options = this._super() || {};

		// We read the type here, because it makes more sense to throw a element type error first,
		// rather then the error for lack of a label. Often if its the wrong type, it
		// won't have a label (e.g. calling on a div, btn, etc)
		this._readType();

		labels = this.element.labels();

		// If there are multiple labels, use the last one
		this.label = $( labels[ labels.length - 1 ] );
		if ( !this.label.length ) {
			$.error( "No label found for checkboxradio widget" );
		}

		this.originalLabel = "";

		// We need to get the label text but this may also need to make sure it does not contain the
		// input itself.
		this.label.contents().not( this.element[ 0 ] ).each( function() {

			// The label contents could be text, html, or a mix. We concat each element to get a
			// string representation of the label, without the input as part of it.
			that.originalLabel += this.nodeType === 3 ? $( this ).text() : this.outerHTML;
		} );

		// Set the label option if we found label text
		if ( this.originalLabel ) {
			options.label = this.originalLabel;
		}

		disabled = this.element[ 0 ].disabled;
		if ( disabled != null ) {
			options.disabled = disabled;
		}
		return options;
	},

	_create: function() {
		var checked = this.element[ 0 ].checked;

		this._bindFormResetHandler();

		if ( this.options.disabled == null ) {
			this.options.disabled = this.element[ 0 ].disabled;
		}

		this._setOption( "disabled", this.options.disabled );
		this._addClass( "ui-checkboxradio", "ui-helper-hidden-accessible" );
		this._addClass( this.label, "ui-checkboxradio-label", "ui-button ui-widget" );

		if ( this.type === "radio" ) {
			this._addClass( this.label, "ui-checkboxradio-radio-label" );
		}

		if ( this.options.label && this.options.label !== this.originalLabel ) {
			this._updateLabel();
		} else if ( this.originalLabel ) {
			this.options.label = this.originalLabel;
		}

		this._enhance();

		if ( checked ) {
			this._addClass( this.label, "ui-checkboxradio-checked", "ui-state-active" );
			if ( this.icon ) {
				this._addClass( this.icon, null, "ui-state-hover" );
			}
		}

		this._on( {
			change: "_toggleClasses",
			focus: function() {
				this._addClass( this.label, null, "ui-state-focus ui-visual-focus" );
			},
			blur: function() {
				this._removeClass( this.label, null, "ui-state-focus ui-visual-focus" );
			}
		} );
	},

	_readType: function() {
		var nodeName = this.element[ 0 ].nodeName.toLowerCase();
		this.type = this.element[ 0 ].type;
		if ( nodeName !== "input" || !/radio|checkbox/.test( this.type ) ) {
			$.error( "Can't create checkboxradio on element.nodeName=" + nodeName +
				" and element.type=" + this.type );
		}
	},

	// Support jQuery Mobile enhanced option
	_enhance: function() {
		this._updateIcon( this.element[ 0 ].checked );
	},

	widget: function() {
		return this.label;
	},

	_getRadioGroup: function() {
		var group;
		var name = this.element[ 0 ].name;
		var nameSelector = "input[name='" + $.ui.escapeSelector( name ) + "']";

		if ( !name ) {
			return $( [] );
		}

		if ( this.form.length ) {
			group = $( this.form[ 0 ].elements ).filter( nameSelector );
		} else {

			// Not inside a form, check all inputs that also are not inside a form
			group = $( nameSelector ).filter( function() {
				return $( this ).form().length === 0;
			} );
		}

		return group.not( this.element );
	},

	_toggleClasses: function() {
		var checked = this.element[ 0 ].checked;
		this._toggleClass( this.label, "ui-checkboxradio-checked", "ui-state-active", checked );

		if ( this.options.icon && this.type === "checkbox" ) {
			this._toggleClass( this.icon, null, "ui-icon-check ui-state-checked", checked )
				._toggleClass( this.icon, null, "ui-icon-blank", !checked );
		}

		if ( this.type === "radio" ) {
			this._getRadioGroup()
				.each( function() {
					var instance = $( this ).checkboxradio( "instance" );

					if ( instance ) {
						instance._removeClass( instance.label,
							"ui-checkboxradio-checked", "ui-state-active" );
					}
				} );
		}
	},

	_destroy: function() {
		this._unbindFormResetHandler();

		if ( this.icon ) {
			this.icon.remove();
			this.iconSpace.remove();
		}
	},

	_setOption: function( key, value ) {

		// We don't allow the value to be set to nothing
		if ( key === "label" && !value ) {
			return;
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this._toggleClass( this.label, null, "ui-state-disabled", value );
			this.element[ 0 ].disabled = value;

			// Don't refresh when setting disabled
			return;
		}
		this.refresh();
	},

	_updateIcon: function( checked ) {
		var toAdd = "ui-icon ui-icon-background ";

		if ( this.options.icon ) {
			if ( !this.icon ) {
				this.icon = $( "<span>" );
				this.iconSpace = $( "<span> </span>" );
				this._addClass( this.iconSpace, "ui-checkboxradio-icon-space" );
			}

			if ( this.type === "checkbox" ) {
				toAdd += checked ? "ui-icon-check ui-state-checked" : "ui-icon-blank";
				this._removeClass( this.icon, null, checked ? "ui-icon-blank" : "ui-icon-check" );
			} else {
				toAdd += "ui-icon-blank";
			}
			this._addClass( this.icon, "ui-checkboxradio-icon", toAdd );
			if ( !checked ) {
				this._removeClass( this.icon, null, "ui-icon-check ui-state-checked" );
			}
			this.icon.prependTo( this.label ).after( this.iconSpace );
		} else if ( this.icon !== undefined ) {
			this.icon.remove();
			this.iconSpace.remove();
			delete this.icon;
		}
	},

	_updateLabel: function() {

		// Remove the contents of the label ( minus the icon, icon space, and input )
		var contents = this.label.contents().not( this.element[ 0 ] );
		if ( this.icon ) {
			contents = contents.not( this.icon[ 0 ] );
		}
		if ( this.iconSpace ) {
			contents = contents.not( this.iconSpace[ 0 ] );
		}
		contents.remove();

		this.label.append( this.options.label );
	},

	refresh: function() {
		var checked = this.element[ 0 ].checked,
			isDisabled = this.element[ 0 ].disabled;

		this._updateIcon( checked );
		this._toggleClass( this.label, "ui-checkboxradio-checked", "ui-state-active", checked );
		if ( this.options.label !== null ) {
			this._updateLabel();
		}

		if ( isDisabled !== this.options.disabled ) {
			this._setOptions( { "disabled": isDisabled } );
		}
	}

} ] );

return $.ui.checkboxradio;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/controlgroup.js":
/*!***********************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/controlgroup.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Controlgroup 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Controlgroup
//>>group: Widgets
//>>description: Visually groups form control widgets
//>>docs: http://api.jqueryui.com/controlgroup/
//>>demos: http://jqueryui.com/controlgroup/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/controlgroup.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {
var controlgroupCornerRegex = /ui-corner-([a-z]){2,6}/g;

return $.widget( "ui.controlgroup", {
	version: "1.12.1",
	defaultElement: "<div>",
	options: {
		direction: "horizontal",
		disabled: null,
		onlyVisible: true,
		items: {
			"button": "input[type=button], input[type=submit], input[type=reset], button, a",
			"controlgroupLabel": ".ui-controlgroup-label",
			"checkboxradio": "input[type='checkbox'], input[type='radio']",
			"selectmenu": "select",
			"spinner": ".ui-spinner-input"
		}
	},

	_create: function() {
		this._enhance();
	},

	// To support the enhanced option in jQuery Mobile, we isolate DOM manipulation
	_enhance: function() {
		this.element.attr( "role", "toolbar" );
		this.refresh();
	},

	_destroy: function() {
		this._callChildMethod( "destroy" );
		this.childWidgets.removeData( "ui-controlgroup-data" );
		this.element.removeAttr( "role" );
		if ( this.options.items.controlgroupLabel ) {
			this.element
				.find( this.options.items.controlgroupLabel )
				.find( ".ui-controlgroup-label-contents" )
				.contents().unwrap();
		}
	},

	_initWidgets: function() {
		var that = this,
			childWidgets = [];

		// First we iterate over each of the items options
		$.each( this.options.items, function( widget, selector ) {
			var labels;
			var options = {};

			// Make sure the widget has a selector set
			if ( !selector ) {
				return;
			}

			if ( widget === "controlgroupLabel" ) {
				labels = that.element.find( selector );
				labels.each( function() {
					var element = $( this );

					if ( element.children( ".ui-controlgroup-label-contents" ).length ) {
						return;
					}
					element.contents()
						.wrapAll( "<span class='ui-controlgroup-label-contents'></span>" );
				} );
				that._addClass( labels, null, "ui-widget ui-widget-content ui-state-default" );
				childWidgets = childWidgets.concat( labels.get() );
				return;
			}

			// Make sure the widget actually exists
			if ( !$.fn[ widget ] ) {
				return;
			}

			// We assume everything is in the middle to start because we can't determine
			// first / last elements until all enhancments are done.
			if ( that[ "_" + widget + "Options" ] ) {
				options = that[ "_" + widget + "Options" ]( "middle" );
			} else {
				options = { classes: {} };
			}

			// Find instances of this widget inside controlgroup and init them
			that.element
				.find( selector )
				.each( function() {
					var element = $( this );
					var instance = element[ widget ]( "instance" );

					// We need to clone the default options for this type of widget to avoid
					// polluting the variable options which has a wider scope than a single widget.
					var instanceOptions = $.widget.extend( {}, options );

					// If the button is the child of a spinner ignore it
					// TODO: Find a more generic solution
					if ( widget === "button" && element.parent( ".ui-spinner" ).length ) {
						return;
					}

					// Create the widget if it doesn't exist
					if ( !instance ) {
						instance = element[ widget ]()[ widget ]( "instance" );
					}
					if ( instance ) {
						instanceOptions.classes =
							that._resolveClassesValues( instanceOptions.classes, instance );
					}
					element[ widget ]( instanceOptions );

					// Store an instance of the controlgroup to be able to reference
					// from the outermost element for changing options and refresh
					var widgetElement = element[ widget ]( "widget" );
					$.data( widgetElement[ 0 ], "ui-controlgroup-data",
						instance ? instance : element[ widget ]( "instance" ) );

					childWidgets.push( widgetElement[ 0 ] );
				} );
		} );

		this.childWidgets = $( $.unique( childWidgets ) );
		this._addClass( this.childWidgets, "ui-controlgroup-item" );
	},

	_callChildMethod: function( method ) {
		this.childWidgets.each( function() {
			var element = $( this ),
				data = element.data( "ui-controlgroup-data" );
			if ( data && data[ method ] ) {
				data[ method ]();
			}
		} );
	},

	_updateCornerClass: function( element, position ) {
		var remove = "ui-corner-top ui-corner-bottom ui-corner-left ui-corner-right ui-corner-all";
		var add = this._buildSimpleOptions( position, "label" ).classes.label;

		this._removeClass( element, null, remove );
		this._addClass( element, null, add );
	},

	_buildSimpleOptions: function( position, key ) {
		var direction = this.options.direction === "vertical";
		var result = {
			classes: {}
		};
		result.classes[ key ] = {
			"middle": "",
			"first": "ui-corner-" + ( direction ? "top" : "left" ),
			"last": "ui-corner-" + ( direction ? "bottom" : "right" ),
			"only": "ui-corner-all"
		}[ position ];

		return result;
	},

	_spinnerOptions: function( position ) {
		var options = this._buildSimpleOptions( position, "ui-spinner" );

		options.classes[ "ui-spinner-up" ] = "";
		options.classes[ "ui-spinner-down" ] = "";

		return options;
	},

	_buttonOptions: function( position ) {
		return this._buildSimpleOptions( position, "ui-button" );
	},

	_checkboxradioOptions: function( position ) {
		return this._buildSimpleOptions( position, "ui-checkboxradio-label" );
	},

	_selectmenuOptions: function( position ) {
		var direction = this.options.direction === "vertical";
		return {
			width: direction ? "auto" : false,
			classes: {
				middle: {
					"ui-selectmenu-button-open": "",
					"ui-selectmenu-button-closed": ""
				},
				first: {
					"ui-selectmenu-button-open": "ui-corner-" + ( direction ? "top" : "tl" ),
					"ui-selectmenu-button-closed": "ui-corner-" + ( direction ? "top" : "left" )
				},
				last: {
					"ui-selectmenu-button-open": direction ? "" : "ui-corner-tr",
					"ui-selectmenu-button-closed": "ui-corner-" + ( direction ? "bottom" : "right" )
				},
				only: {
					"ui-selectmenu-button-open": "ui-corner-top",
					"ui-selectmenu-button-closed": "ui-corner-all"
				}

			}[ position ]
		};
	},

	_resolveClassesValues: function( classes, instance ) {
		var result = {};
		$.each( classes, function( key ) {
			var current = instance.options.classes[ key ] || "";
			current = $.trim( current.replace( controlgroupCornerRegex, "" ) );
			result[ key ] = ( current + " " + classes[ key ] ).replace( /\s+/g, " " );
		} );
		return result;
	},

	_setOption: function( key, value ) {
		if ( key === "direction" ) {
			this._removeClass( "ui-controlgroup-" + this.options.direction );
		}

		this._super( key, value );
		if ( key === "disabled" ) {
			this._callChildMethod( value ? "disable" : "enable" );
			return;
		}

		this.refresh();
	},

	refresh: function() {
		var children,
			that = this;

		this._addClass( "ui-controlgroup ui-controlgroup-" + this.options.direction );

		if ( this.options.direction === "horizontal" ) {
			this._addClass( null, "ui-helper-clearfix" );
		}
		this._initWidgets();

		children = this.childWidgets;

		// We filter here because we need to track all childWidgets not just the visible ones
		if ( this.options.onlyVisible ) {
			children = children.filter( ":visible" );
		}

		if ( children.length ) {

			// We do this last because we need to make sure all enhancment is done
			// before determining first and last
			$.each( [ "first", "last" ], function( index, value ) {
				var instance = children[ value ]().data( "ui-controlgroup-data" );

				if ( instance && that[ "_" + instance.widgetName + "Options" ] ) {
					var options = that[ "_" + instance.widgetName + "Options" ](
						children.length === 1 ? "only" : value
					);
					options.classes = that._resolveClassesValues( options.classes, instance );
					instance.element[ instance.widgetName ]( options );
				} else {
					that._updateCornerClass( children[ value ](), value );
				}
			} );

			// Finally call the refresh method on each of the child widgets.
			this._callChildMethod( "refresh" );
		}
	}
} );
} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/dialog.js":
/*!*****************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/dialog.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Dialog 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Dialog
//>>group: Widgets
//>>description: Displays customizable dialog windows.
//>>docs: http://api.jqueryui.com/dialog/
//>>demos: http://jqueryui.com/dialog/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/dialog.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ./button */ "./node_modules/jquery-ui/ui/widgets/button.js"),
			__webpack_require__(/*! ./draggable */ "./node_modules/jquery-ui/ui/widgets/draggable.js"),
			__webpack_require__(/*! ./mouse */ "./node_modules/jquery-ui/ui/widgets/mouse.js"),
			__webpack_require__(/*! ./resizable */ "./node_modules/jquery-ui/ui/widgets/resizable.js"),
			__webpack_require__(/*! ../focusable */ "./node_modules/jquery-ui/ui/focusable.js"),
			__webpack_require__(/*! ../keycode */ "./node_modules/jquery-ui/ui/keycode.js"),
			__webpack_require__(/*! ../position */ "./node_modules/jquery-ui/ui/position.js"),
			__webpack_require__(/*! ../safe-active-element */ "./node_modules/jquery-ui/ui/safe-active-element.js"),
			__webpack_require__(/*! ../safe-blur */ "./node_modules/jquery-ui/ui/safe-blur.js"),
			__webpack_require__(/*! ../tabbable */ "./node_modules/jquery-ui/ui/tabbable.js"),
			__webpack_require__(/*! ../unique-id */ "./node_modules/jquery-ui/ui/unique-id.js"),
			__webpack_require__(/*! ../version */ "./node_modules/jquery-ui/ui/version.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

$.widget( "ui.dialog", {
	version: "1.12.1",
	options: {
		appendTo: "body",
		autoOpen: true,
		buttons: [],
		classes: {
			"ui-dialog": "ui-corner-all",
			"ui-dialog-titlebar": "ui-corner-all"
		},
		closeOnEscape: true,
		closeText: "Close",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: null,
		maxWidth: null,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",

			// Ensure the titlebar is always visible
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		title: null,
		width: 300,

		// Callbacks
		beforeClose: null,
		close: null,
		drag: null,
		dragStart: null,
		dragStop: null,
		focus: null,
		open: null,
		resize: null,
		resizeStart: null,
		resizeStop: null
	},

	sizeRelatedOptions: {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},

	resizableRelatedOptions: {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	},

	_create: function() {
		this.originalCss = {
			display: this.element[ 0 ].style.display,
			width: this.element[ 0 ].style.width,
			minHeight: this.element[ 0 ].style.minHeight,
			maxHeight: this.element[ 0 ].style.maxHeight,
			height: this.element[ 0 ].style.height
		};
		this.originalPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.originalTitle = this.element.attr( "title" );
		if ( this.options.title == null && this.originalTitle != null ) {
			this.options.title = this.originalTitle;
		}

		// Dialogs can't be disabled
		if ( this.options.disabled ) {
			this.options.disabled = false;
		}

		this._createWrapper();

		this.element
			.show()
			.removeAttr( "title" )
			.appendTo( this.uiDialog );

		this._addClass( "ui-dialog-content", "ui-widget-content" );

		this._createTitlebar();
		this._createButtonPane();

		if ( this.options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( this.options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._isOpen = false;

		this._trackFocus();
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;
		if ( element && ( element.jquery || element.nodeType ) ) {
			return $( element );
		}
		return this.document.find( element || "body" ).eq( 0 );
	},

	_destroy: function() {
		var next,
			originalPosition = this.originalPosition;

		this._untrackInstance();
		this._destroyOverlay();

		this.element
			.removeUniqueId()
			.css( this.originalCss )

			// Without detaching first, the following becomes really slow
			.detach();

		this.uiDialog.remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = originalPosition.parent.children().eq( originalPosition.index );

		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[ 0 ] !== this.element[ 0 ] ) {
			next.before( this.element );
		} else {
			originalPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	disable: $.noop,
	enable: $.noop,

	close: function( event ) {
		var that = this;

		if ( !this._isOpen || this._trigger( "beforeClose", event ) === false ) {
			return;
		}

		this._isOpen = false;
		this._focusedElement = null;
		this._destroyOverlay();
		this._untrackInstance();

		if ( !this.opener.filter( ":focusable" ).trigger( "focus" ).length ) {

			// Hiding a focused element doesn't trigger blur in WebKit
			// so in case we have nothing to focus on, explicitly blur the active element
			// https://bugs.webkit.org/show_bug.cgi?id=47182
			$.ui.safeBlur( $.ui.safeActiveElement( this.document[ 0 ] ) );
		}

		this._hide( this.uiDialog, this.options.hide, function() {
			that._trigger( "close", event );
		} );
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function() {
		this._moveToTop();
	},

	_moveToTop: function( event, silent ) {
		var moved = false,
			zIndices = this.uiDialog.siblings( ".ui-front:visible" ).map( function() {
				return +$( this ).css( "z-index" );
			} ).get(),
			zIndexMax = Math.max.apply( null, zIndices );

		if ( zIndexMax >= +this.uiDialog.css( "z-index" ) ) {
			this.uiDialog.css( "z-index", zIndexMax + 1 );
			moved = true;
		}

		if ( moved && !silent ) {
			this._trigger( "focus", event );
		}
		return moved;
	},

	open: function() {
		var that = this;
		if ( this._isOpen ) {
			if ( this._moveToTop() ) {
				this._focusTabbable();
			}
			return;
		}

		this._isOpen = true;
		this.opener = $( $.ui.safeActiveElement( this.document[ 0 ] ) );

		this._size();
		this._position();
		this._createOverlay();
		this._moveToTop( null, true );

		// Ensure the overlay is moved to the top with the dialog, but only when
		// opening. The overlay shouldn't move after the dialog is open so that
		// modeless dialogs opened after the modal dialog stack properly.
		if ( this.overlay ) {
			this.overlay.css( "z-index", this.uiDialog.css( "z-index" ) - 1 );
		}

		this._show( this.uiDialog, this.options.show, function() {
			that._focusTabbable();
			that._trigger( "focus" );
		} );

		// Track the dialog immediately upon openening in case a focus event
		// somehow occurs outside of the dialog before an element inside the
		// dialog is focused (#10152)
		this._makeFocusTarget();

		this._trigger( "open" );
	},

	_focusTabbable: function() {

		// Set focus to the first match:
		// 1. An element that was focused previously
		// 2. First element inside the dialog matching [autofocus]
		// 3. Tabbable element inside the content element
		// 4. Tabbable element inside the buttonpane
		// 5. The close button
		// 6. The dialog itself
		var hasFocus = this._focusedElement;
		if ( !hasFocus ) {
			hasFocus = this.element.find( "[autofocus]" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.element.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogTitlebarClose.filter( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialog;
		}
		hasFocus.eq( 0 ).trigger( "focus" );
	},

	_keepFocus: function( event ) {
		function checkFocus() {
			var activeElement = $.ui.safeActiveElement( this.document[ 0 ] ),
				isActive = this.uiDialog[ 0 ] === activeElement ||
					$.contains( this.uiDialog[ 0 ], activeElement );
			if ( !isActive ) {
				this._focusTabbable();
			}
		}
		event.preventDefault();
		checkFocus.call( this );

		// support: IE
		// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
		// so we check again later
		this._delay( checkFocus );
	},

	_createWrapper: function() {
		this.uiDialog = $( "<div>" )
			.hide()
			.attr( {

				// Setting tabIndex makes the div focusable
				tabIndex: -1,
				role: "dialog"
			} )
			.appendTo( this._appendTo() );

		this._addClass( this.uiDialog, "ui-dialog", "ui-widget ui-widget-content ui-front" );
		this._on( this.uiDialog, {
			keydown: function( event ) {
				if ( this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE ) {
					event.preventDefault();
					this.close( event );
					return;
				}

				// Prevent tabbing out of dialogs
				if ( event.keyCode !== $.ui.keyCode.TAB || event.isDefaultPrevented() ) {
					return;
				}
				var tabbables = this.uiDialog.find( ":tabbable" ),
					first = tabbables.filter( ":first" ),
					last = tabbables.filter( ":last" );

				if ( ( event.target === last[ 0 ] || event.target === this.uiDialog[ 0 ] ) &&
						!event.shiftKey ) {
					this._delay( function() {
						first.trigger( "focus" );
					} );
					event.preventDefault();
				} else if ( ( event.target === first[ 0 ] ||
						event.target === this.uiDialog[ 0 ] ) && event.shiftKey ) {
					this._delay( function() {
						last.trigger( "focus" );
					} );
					event.preventDefault();
				}
			},
			mousedown: function( event ) {
				if ( this._moveToTop( event ) ) {
					this._focusTabbable();
				}
			}
		} );

		// We assume that any existing aria-describedby attribute means
		// that the dialog content is marked up properly
		// otherwise we brute force the content as the description
		if ( !this.element.find( "[aria-describedby]" ).length ) {
			this.uiDialog.attr( {
				"aria-describedby": this.element.uniqueId().attr( "id" )
			} );
		}
	},

	_createTitlebar: function() {
		var uiDialogTitle;

		this.uiDialogTitlebar = $( "<div>" );
		this._addClass( this.uiDialogTitlebar,
			"ui-dialog-titlebar", "ui-widget-header ui-helper-clearfix" );
		this._on( this.uiDialogTitlebar, {
			mousedown: function( event ) {

				// Don't prevent click on close button (#8838)
				// Focusing a dialog that is partially scrolled out of view
				// causes the browser to scroll it into view, preventing the click event
				if ( !$( event.target ).closest( ".ui-dialog-titlebar-close" ) ) {

					// Dialog isn't getting focus when dragging (#8063)
					this.uiDialog.trigger( "focus" );
				}
			}
		} );

		// Support: IE
		// Use type="button" to prevent enter keypresses in textboxes from closing the
		// dialog in IE (#9312)
		this.uiDialogTitlebarClose = $( "<button type='button'></button>" )
			.button( {
				label: $( "<a>" ).text( this.options.closeText ).html(),
				icon: "ui-icon-closethick",
				showLabel: false
			} )
			.appendTo( this.uiDialogTitlebar );

		this._addClass( this.uiDialogTitlebarClose, "ui-dialog-titlebar-close" );
		this._on( this.uiDialogTitlebarClose, {
			click: function( event ) {
				event.preventDefault();
				this.close( event );
			}
		} );

		uiDialogTitle = $( "<span>" ).uniqueId().prependTo( this.uiDialogTitlebar );
		this._addClass( uiDialogTitle, "ui-dialog-title" );
		this._title( uiDialogTitle );

		this.uiDialogTitlebar.prependTo( this.uiDialog );

		this.uiDialog.attr( {
			"aria-labelledby": uiDialogTitle.attr( "id" )
		} );
	},

	_title: function( title ) {
		if ( this.options.title ) {
			title.text( this.options.title );
		} else {
			title.html( "&#160;" );
		}
	},

	_createButtonPane: function() {
		this.uiDialogButtonPane = $( "<div>" );
		this._addClass( this.uiDialogButtonPane, "ui-dialog-buttonpane",
			"ui-widget-content ui-helper-clearfix" );

		this.uiButtonSet = $( "<div>" )
			.appendTo( this.uiDialogButtonPane );
		this._addClass( this.uiButtonSet, "ui-dialog-buttonset" );

		this._createButtons();
	},

	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons;

		// If we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( $.isEmptyObject( buttons ) || ( $.isArray( buttons ) && !buttons.length ) ) {
			this._removeClass( this.uiDialog, "ui-dialog-buttons" );
			return;
		}

		$.each( buttons, function( name, props ) {
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;

			// Default to a non-submitting button
			props = $.extend( { type: "button" }, props );

			// Change the context for the click callback to be the main element
			click = props.click;
			buttonOptions = {
				icon: props.icon,
				iconPosition: props.iconPosition,
				showLabel: props.showLabel,

				// Deprecated options
				icons: props.icons,
				text: props.text
			};

			delete props.click;
			delete props.icon;
			delete props.iconPosition;
			delete props.showLabel;

			// Deprecated options
			delete props.icons;
			if ( typeof props.text === "boolean" ) {
				delete props.text;
			}

			$( "<button></button>", props )
				.button( buttonOptions )
				.appendTo( that.uiButtonSet )
				.on( "click", function() {
					click.apply( that.element[ 0 ], arguments );
				} );
		} );
		this._addClass( this.uiDialog, "ui-dialog-buttons" );
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable( {
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				that._addClass( $( this ), "ui-dialog-dragging" );
				that._blockFrames();
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var left = ui.offset.left - that.document.scrollLeft(),
					top = ui.offset.top - that.document.scrollTop();

				options.position = {
					my: "left top",
					at: "left" + ( left >= 0 ? "+" : "" ) + left + " " +
						"top" + ( top >= 0 ? "+" : "" ) + top,
					of: that.window
				};
				that._removeClass( $( this ), "ui-dialog-dragging" );
				that._unblockFrames();
				that._trigger( "dragStop", event, filteredUi( ui ) );
			}
		} );
	},

	_makeResizable: function() {
		var that = this,
			options = this.options,
			handles = options.resizable,

			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css( "position" ),
			resizeHandles = typeof handles === "string" ?
				handles :
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable( {
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				that._addClass( $( this ), "ui-dialog-resizing" );
				that._blockFrames();
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var offset = that.uiDialog.offset(),
					left = offset.left - that.document.scrollLeft(),
					top = offset.top - that.document.scrollTop();

				options.height = that.uiDialog.height();
				options.width = that.uiDialog.width();
				options.position = {
					my: "left top",
					at: "left" + ( left >= 0 ? "+" : "" ) + left + " " +
						"top" + ( top >= 0 ? "+" : "" ) + top,
					of: that.window
				};
				that._removeClass( $( this ), "ui-dialog-resizing" );
				that._unblockFrames();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
			}
		} )
			.css( "position", position );
	},

	_trackFocus: function() {
		this._on( this.widget(), {
			focusin: function( event ) {
				this._makeFocusTarget();
				this._focusedElement = $( event.target );
			}
		} );
	},

	_makeFocusTarget: function() {
		this._untrackInstance();
		this._trackingInstances().unshift( this );
	},

	_untrackInstance: function() {
		var instances = this._trackingInstances(),
			exists = $.inArray( this, instances );
		if ( exists !== -1 ) {
			instances.splice( exists, 1 );
		}
	},

	_trackingInstances: function() {
		var instances = this.document.data( "ui-dialog-instances" );
		if ( !instances ) {
			instances = [];
			this.document.data( "ui-dialog-instances", instances );
		}
		return instances;
	},

	_minHeight: function() {
		var options = this.options;

		return options.height === "auto" ?
			options.minHeight :
			Math.min( options.minHeight, options.height );
	},

	_position: function() {

		// Need to show the dialog to get the actual offset in the position plugin
		var isVisible = this.uiDialog.is( ":visible" );
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( this.options.position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resize = false,
			resizableOptions = {};

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in that.sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in that.resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		} );

		if ( resize ) {
			this._size();
			this._position();
		}
		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		if ( key === "disabled" ) {
			return;
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.uiDialog.appendTo( this._appendTo() );
		}

		if ( key === "buttons" ) {
			this._createButtons();
		}

		if ( key === "closeText" ) {
			this.uiDialogTitlebarClose.button( {

				// Ensure that we always pass a string
				label: $( "<a>" ).text( "" + this.options.closeText ).html()
			} );
		}

		if ( key === "draggable" ) {
			isDraggable = uiDialog.is( ":data(ui-draggable)" );
			if ( isDraggable && !value ) {
				uiDialog.draggable( "destroy" );
			}

			if ( !isDraggable && value ) {
				this._makeDraggable();
			}
		}

		if ( key === "position" ) {
			this._position();
		}

		if ( key === "resizable" ) {

			// currently resizable, becoming non-resizable
			isResizable = uiDialog.is( ":data(ui-resizable)" );
			if ( isResizable && !value ) {
				uiDialog.resizable( "destroy" );
			}

			// Currently resizable, changing handles
			if ( isResizable && typeof value === "string" ) {
				uiDialog.resizable( "option", "handles", value );
			}

			// Currently non-resizable, becoming resizable
			if ( !isResizable && value !== false ) {
				this._makeResizable();
			}
		}

		if ( key === "title" ) {
			this._title( this.uiDialogTitlebar.find( ".ui-dialog-title" ) );
		}
	},

	_size: function() {

		// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight, maxContentHeight,
			options = this.options;

		// Reset content sizing
		this.element.show().css( {
			width: "auto",
			minHeight: 0,
			maxHeight: "none",
			height: 0
		} );

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// Reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css( {
			height: "auto",
			width: options.width
		} )
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		maxContentHeight = typeof options.maxHeight === "number" ?
			Math.max( 0, options.maxHeight - nonContentHeight ) :
			"none";

		if ( options.height === "auto" ) {
			this.element.css( {
				minHeight: minContentHeight,
				maxHeight: maxContentHeight,
				height: "auto"
			} );
		} else {
			this.element.height( Math.max( 0, options.height - nonContentHeight ) );
		}

		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	},

	_blockFrames: function() {
		this.iframeBlocks = this.document.find( "iframe" ).map( function() {
			var iframe = $( this );

			return $( "<div>" )
				.css( {
					position: "absolute",
					width: iframe.outerWidth(),
					height: iframe.outerHeight()
				} )
				.appendTo( iframe.parent() )
				.offset( iframe.offset() )[ 0 ];
		} );
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_allowInteraction: function( event ) {
		if ( $( event.target ).closest( ".ui-dialog" ).length ) {
			return true;
		}

		// TODO: Remove hack when datepicker implements
		// the .ui-front logic (#8989)
		return !!$( event.target ).closest( ".ui-datepicker" ).length;
	},

	_createOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		// We use a delay in case the overlay is created from an
		// event that we're going to be cancelling (#2804)
		var isOpening = true;
		this._delay( function() {
			isOpening = false;
		} );

		if ( !this.document.data( "ui-dialog-overlays" ) ) {

			// Prevent use of anchors and inputs
			// Using _on() for an event handler shared across many instances is
			// safe because the dialogs stack and must be closed in reverse order
			this._on( this.document, {
				focusin: function( event ) {
					if ( isOpening ) {
						return;
					}

					if ( !this._allowInteraction( event ) ) {
						event.preventDefault();
						this._trackingInstances()[ 0 ]._focusTabbable();
					}
				}
			} );
		}

		this.overlay = $( "<div>" )
			.appendTo( this._appendTo() );

		this._addClass( this.overlay, null, "ui-widget-overlay ui-front" );
		this._on( this.overlay, {
			mousedown: "_keepFocus"
		} );
		this.document.data( "ui-dialog-overlays",
			( this.document.data( "ui-dialog-overlays" ) || 0 ) + 1 );
	},

	_destroyOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		if ( this.overlay ) {
			var overlays = this.document.data( "ui-dialog-overlays" ) - 1;

			if ( !overlays ) {
				this._off( this.document, "focusin" );
				this.document.removeData( "ui-dialog-overlays" );
			} else {
				this.document.data( "ui-dialog-overlays", overlays );
			}

			this.overlay.remove();
			this.overlay = null;
		}
	}
} );

// DEPRECATED
// TODO: switch return back to widget declaration at top of file when this is removed
if ( $.uiBackCompat !== false ) {

	// Backcompat for dialogClass option
	$.widget( "ui.dialog", $.ui.dialog, {
		options: {
			dialogClass: ""
		},
		_createWrapper: function() {
			this._super();
			this.uiDialog.addClass( this.options.dialogClass );
		},
		_setOption: function( key, value ) {
			if ( key === "dialogClass" ) {
				this.uiDialog
					.removeClass( this.options.dialogClass )
					.addClass( value );
			}
			this._superApply( arguments );
		}
	} );
}

return $.ui.dialog;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/draggable.js":
/*!********************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/draggable.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Draggable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Draggable
//>>group: Interactions
//>>description: Enables dragging functionality for any element.
//>>docs: http://api.jqueryui.com/draggable/
//>>demos: http://jqueryui.com/draggable/
//>>css.structure: ../../themes/base/draggable.css

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ./mouse */ "./node_modules/jquery-ui/ui/widgets/mouse.js"),
			__webpack_require__(/*! ../data */ "./node_modules/jquery-ui/ui/data.js"),
			__webpack_require__(/*! ../plugin */ "./node_modules/jquery-ui/ui/plugin.js"),
			__webpack_require__(/*! ../safe-active-element */ "./node_modules/jquery-ui/ui/safe-active-element.js"),
			__webpack_require__(/*! ../safe-blur */ "./node_modules/jquery-ui/ui/safe-blur.js"),
			__webpack_require__(/*! ../scroll-parent */ "./node_modules/jquery-ui/ui/scroll-parent.js"),
			__webpack_require__(/*! ../version */ "./node_modules/jquery-ui/ui/version.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

$.widget( "ui.draggable", $.ui.mouse, {
	version: "1.12.1",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false,

		// Callbacks
		drag: null,
		start: null,
		stop: null
	},
	_create: function() {

		if ( this.options.helper === "original" ) {
			this._setPositionRelative();
		}
		if ( this.options.addClasses ) {
			this._addClass( "ui-draggable" );
		}
		this._setHandleClassName();

		this._mouseInit();
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "handle" ) {
			this._removeHandleClassName();
			this._setHandleClassName();
		}
	},

	_destroy: function() {
		if ( ( this.helper || this.element ).is( ".ui-draggable-dragging" ) ) {
			this.destroyOnClear = true;
			return;
		}
		this._removeHandleClassName();
		this._mouseDestroy();
	},

	_mouseCapture: function( event ) {
		var o = this.options;

		// Among others, prevent a drag on a resizable-handle
		if ( this.helper || o.disabled ||
				$( event.target ).closest( ".ui-resizable-handle" ).length > 0 ) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.handle = this._getHandle( event );
		if ( !this.handle ) {
			return false;
		}

		this._blurActiveElement( event );

		this._blockFrames( o.iframeFix === true ? "iframe" : o.iframeFix );

		return true;

	},

	_blockFrames: function( selector ) {
		this.iframeBlocks = this.document.find( selector ).map( function() {
			var iframe = $( this );

			return $( "<div>" )
				.css( "position", "absolute" )
				.appendTo( iframe.parent() )
				.outerWidth( iframe.outerWidth() )
				.outerHeight( iframe.outerHeight() )
				.offset( iframe.offset() )[ 0 ];
		} );
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_blurActiveElement: function( event ) {
		var activeElement = $.ui.safeActiveElement( this.document[ 0 ] ),
			target = $( event.target );

		// Don't blur if the event occurred on an element that is within
		// the currently focused element
		// See #10527, #12472
		if ( target.closest( activeElement ).length ) {
			return;
		}

		// Blur any element that currently has focus, see #4261
		$.ui.safeBlur( activeElement );
	},

	_mouseStart: function( event ) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper( event );

		this._addClass( this.helper, "ui-draggable-dragging" );

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.current = this;
		}

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css( "position" );
		this.scrollParent = this.helper.scrollParent( true );
		this.offsetParent = this.helper.offsetParent();
		this.hasFixedAncestor = this.helper.parents().filter( function() {
				return $( this ).css( "position" ) === "fixed";
			} ).length > 0;

		//The element's absolute position on the page minus margins
		this.positionAbs = this.element.offset();
		this._refreshOffsets( event );

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition( event, false );
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		( o.cursorAt && this._adjustOffsetFromHelper( o.cursorAt ) );

		//Set a containment if given in the options
		this._setContainment();

		//Trigger event + callbacks
		if ( this._trigger( "start", event ) === false ) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ( $.ui.ddmanager && !o.dropBehaviour ) {
			$.ui.ddmanager.prepareOffsets( this, event );
		}

		// Execute the drag once - this causes the helper not to be visible before getting its
		// correct position
		this._mouseDrag( event, true );

		// If the ddmanager is used for droppables, inform the manager that dragging has started
		// (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStart( this, event );
		}

		return true;
	},

	_refreshOffsets: function( event ) {
		this.offset = {
			top: this.positionAbs.top - this.margins.top,
			left: this.positionAbs.left - this.margins.left,
			scroll: false,
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset()
		};

		this.offset.click = {
			left: event.pageX - this.offset.left,
			top: event.pageY - this.offset.top
		};
	},

	_mouseDrag: function( event, noPropagation ) {

		// reset any necessary cached properties (see #5009)
		if ( this.hasFixedAncestor ) {
			this.offset.parent = this._getParentOffset();
		}

		//Compute the helpers position
		this.position = this._generatePosition( event, true );
		this.positionAbs = this._convertPositionTo( "absolute" );

		//Call plugins and callbacks and use the resulting position if something is returned
		if ( !noPropagation ) {
			var ui = this._uiHash();
			if ( this._trigger( "drag", event, ui ) === false ) {
				this._mouseUp( new $.Event( "mouseup", event ) );
				return false;
			}
			this.position = ui.position;
		}

		this.helper[ 0 ].style.left = this.position.left + "px";
		this.helper[ 0 ].style.top = this.position.top + "px";

		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.drag( this, event );
		}

		return false;
	},

	_mouseStop: function( event ) {

		//If we are using droppables, inform the manager about the drop
		var that = this,
			dropped = false;
		if ( $.ui.ddmanager && !this.options.dropBehaviour ) {
			dropped = $.ui.ddmanager.drop( this, event );
		}

		//if a drop comes from outside (a sortable)
		if ( this.dropped ) {
			dropped = this.dropped;
			this.dropped = false;
		}

		if ( ( this.options.revert === "invalid" && !dropped ) ||
				( this.options.revert === "valid" && dropped ) ||
				this.options.revert === true || ( $.isFunction( this.options.revert ) &&
				this.options.revert.call( this.element, dropped ) )
		) {
			$( this.helper ).animate(
				this.originalPosition,
				parseInt( this.options.revertDuration, 10 ),
				function() {
					if ( that._trigger( "stop", event ) !== false ) {
						that._clear();
					}
				}
			);
		} else {
			if ( this._trigger( "stop", event ) !== false ) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function( event ) {
		this._unblockFrames();

		// If the ddmanager is used for droppables, inform the manager that dragging has stopped
		// (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStop( this, event );
		}

		// Only need to focus if the event occurred on the draggable itself, see #10527
		if ( this.handleElement.is( event.target ) ) {

			// The interaction is over; whether or not the click resulted in a drag,
			// focus the element
			this.element.trigger( "focus" );
		}

		return $.ui.mouse.prototype._mouseUp.call( this, event );
	},

	cancel: function() {

		if ( this.helper.is( ".ui-draggable-dragging" ) ) {
			this._mouseUp( new $.Event( "mouseup", { target: this.element[ 0 ] } ) );
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function( event ) {
		return this.options.handle ?
			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
			true;
	},

	_setHandleClassName: function() {
		this.handleElement = this.options.handle ?
			this.element.find( this.options.handle ) : this.element;
		this._addClass( this.handleElement, "ui-draggable-handle" );
	},

	_removeHandleClassName: function() {
		this._removeClass( this.handleElement, "ui-draggable-handle" );
	},

	_createHelper: function( event ) {

		var o = this.options,
			helperIsFunction = $.isFunction( o.helper ),
			helper = helperIsFunction ?
				$( o.helper.apply( this.element[ 0 ], [ event ] ) ) :
				( o.helper === "clone" ?
					this.element.clone().removeAttr( "id" ) :
					this.element );

		if ( !helper.parents( "body" ).length ) {
			helper.appendTo( ( o.appendTo === "parent" ?
				this.element[ 0 ].parentNode :
				o.appendTo ) );
		}

		// Http://bugs.jqueryui.com/ticket/9446
		// a helper function can return the original element
		// which wouldn't have been set to relative in _create
		if ( helperIsFunction && helper[ 0 ] === this.element[ 0 ] ) {
			this._setPositionRelative();
		}

		if ( helper[ 0 ] !== this.element[ 0 ] &&
				!( /(fixed|absolute)/ ).test( helper.css( "position" ) ) ) {
			helper.css( "position", "absolute" );
		}

		return helper;

	},

	_setPositionRelative: function() {
		if ( !( /^(?:r|a|f)/ ).test( this.element.css( "position" ) ) ) {
			this.element[ 0 ].style.position = "relative";
		}
	},

	_adjustOffsetFromHelper: function( obj ) {
		if ( typeof obj === "string" ) {
			obj = obj.split( " " );
		}
		if ( $.isArray( obj ) ) {
			obj = { left: +obj[ 0 ], top: +obj[ 1 ] || 0 };
		}
		if ( "left" in obj ) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ( "right" in obj ) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ( "top" in obj ) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ( "bottom" in obj ) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_isRootNode: function( element ) {
		return ( /(html|body)/i ).test( element.tagName ) || element === this.document[ 0 ];
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		var po = this.offsetParent.offset(),
			document = this.document[ 0 ];

		// This is a special case where we need to modify a offset calculated on start, since the
		// following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the
		// next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't
		// the document, which means that the scroll is included in the initial calculation of the
		// offset of the parent, and never recalculated upon drag
		if ( this.cssPosition === "absolute" && this.scrollParent[ 0 ] !== document &&
				$.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if ( this._isRootNode( this.offsetParent[ 0 ] ) ) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + ( parseInt( this.offsetParent.css( "borderTopWidth" ), 10 ) || 0 ),
			left: po.left + ( parseInt( this.offsetParent.css( "borderLeftWidth" ), 10 ) || 0 )
		};

	},

	_getRelativeOffset: function() {
		if ( this.cssPosition !== "relative" ) {
			return { top: 0, left: 0 };
		}

		var p = this.element.position(),
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: p.top - ( parseInt( this.helper.css( "top" ), 10 ) || 0 ) +
				( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
			left: p.left - ( parseInt( this.helper.css( "left" ), 10 ) || 0 ) +
				( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
		};

	},

	_cacheMargins: function() {
		this.margins = {
			left: ( parseInt( this.element.css( "marginLeft" ), 10 ) || 0 ),
			top: ( parseInt( this.element.css( "marginTop" ), 10 ) || 0 ),
			right: ( parseInt( this.element.css( "marginRight" ), 10 ) || 0 ),
			bottom: ( parseInt( this.element.css( "marginBottom" ), 10 ) || 0 )
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var isUserScrollable, c, ce,
			o = this.options,
			document = this.document[ 0 ];

		this.relativeContainer = null;

		if ( !o.containment ) {
			this.containment = null;
			return;
		}

		if ( o.containment === "window" ) {
			this.containment = [
				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
				$( window ).scrollLeft() + $( window ).width() -
					this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() +
					( $( window ).height() || document.body.parentNode.scrollHeight ) -
					this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document" ) {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) -
					this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment.constructor === Array ) {
			this.containment = o.containment;
			return;
		}

		if ( o.containment === "parent" ) {
			o.containment = this.helper[ 0 ].parentNode;
		}

		c = $( o.containment );
		ce = c[ 0 ];

		if ( !ce ) {
			return;
		}

		isUserScrollable = /(scroll|auto)/.test( c.css( "overflow" ) );

		this.containment = [
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) +
				( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) +
				( parseInt( c.css( "paddingTop" ), 10 ) || 0 ),
			( isUserScrollable ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) -
				( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) -
				( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) -
				this.helperProportions.width -
				this.margins.left -
				this.margins.right,
			( isUserScrollable ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) -
				( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) -
				( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) -
				this.helperProportions.height -
				this.margins.top -
				this.margins.bottom
		];
		this.relativeContainer = c;
	},

	_convertPositionTo: function( d, pos ) {

		if ( !pos ) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: (

				// The absolute mouse position
				pos.top	+

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.top * mod +

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.top * mod -
				( ( this.cssPosition === "fixed" ?
					-this.offset.scroll.top :
					( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod )
			),
			left: (

				// The absolute mouse position
				pos.left +

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.left * mod +

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.left * mod	-
				( ( this.cssPosition === "fixed" ?
					-this.offset.scroll.left :
					( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod )
			)
		};

	},

	_generatePosition: function( event, constrainPosition ) {

		var containment, co, top, left,
			o = this.options,
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] ),
			pageX = event.pageX,
			pageY = event.pageY;

		// Cache the scroll
		if ( !scrollIsRootNode || !this.offset.scroll ) {
			this.offset.scroll = {
				top: this.scrollParent.scrollTop(),
				left: this.scrollParent.scrollLeft()
			};
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		// If we are not dragging yet, we won't check for options
		if ( constrainPosition ) {
			if ( this.containment ) {
				if ( this.relativeContainer ) {
					co = this.relativeContainer.offset();
					containment = [
						this.containment[ 0 ] + co.left,
						this.containment[ 1 ] + co.top,
						this.containment[ 2 ] + co.left,
						this.containment[ 3 ] + co.top
					];
				} else {
					containment = this.containment;
				}

				if ( event.pageX - this.offset.click.left < containment[ 0 ] ) {
					pageX = containment[ 0 ] + this.offset.click.left;
				}
				if ( event.pageY - this.offset.click.top < containment[ 1 ] ) {
					pageY = containment[ 1 ] + this.offset.click.top;
				}
				if ( event.pageX - this.offset.click.left > containment[ 2 ] ) {
					pageX = containment[ 2 ] + this.offset.click.left;
				}
				if ( event.pageY - this.offset.click.top > containment[ 3 ] ) {
					pageY = containment[ 3 ] + this.offset.click.top;
				}
			}

			if ( o.grid ) {

				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid
				// argument errors in IE (see ticket #6950)
				top = o.grid[ 1 ] ? this.originalPageY + Math.round( ( pageY -
					this.originalPageY ) / o.grid[ 1 ] ) * o.grid[ 1 ] : this.originalPageY;
				pageY = containment ? ( ( top - this.offset.click.top >= containment[ 1 ] ||
					top - this.offset.click.top > containment[ 3 ] ) ?
						top :
						( ( top - this.offset.click.top >= containment[ 1 ] ) ?
							top - o.grid[ 1 ] : top + o.grid[ 1 ] ) ) : top;

				left = o.grid[ 0 ] ? this.originalPageX +
					Math.round( ( pageX - this.originalPageX ) / o.grid[ 0 ] ) * o.grid[ 0 ] :
					this.originalPageX;
				pageX = containment ? ( ( left - this.offset.click.left >= containment[ 0 ] ||
					left - this.offset.click.left > containment[ 2 ] ) ?
						left :
						( ( left - this.offset.click.left >= containment[ 0 ] ) ?
							left - o.grid[ 0 ] : left + o.grid[ 0 ] ) ) : left;
			}

			if ( o.axis === "y" ) {
				pageX = this.originalPageX;
			}

			if ( o.axis === "x" ) {
				pageY = this.originalPageY;
			}
		}

		return {
			top: (

				// The absolute mouse position
				pageY -

				// Click offset (relative to the element)
				this.offset.click.top -

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.top -

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.top +
				( this.cssPosition === "fixed" ?
					-this.offset.scroll.top :
					( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
			),
			left: (

				// The absolute mouse position
				pageX -

				// Click offset (relative to the element)
				this.offset.click.left -

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.left -

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.left +
				( this.cssPosition === "fixed" ?
					-this.offset.scroll.left :
					( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
			)
		};

	},

	_clear: function() {
		this._removeClass( this.helper, "ui-draggable-dragging" );
		if ( this.helper[ 0 ] !== this.element[ 0 ] && !this.cancelHelperRemoval ) {
			this.helper.remove();
		}
		this.helper = null;
		this.cancelHelperRemoval = false;
		if ( this.destroyOnClear ) {
			this.destroy();
		}
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function( type, event, ui ) {
		ui = ui || this._uiHash();
		$.ui.plugin.call( this, type, [ event, ui, this ], true );

		// Absolute position and offset (see #6884 ) have to be recalculated after plugins
		if ( /^(drag|start|stop)/.test( type ) ) {
			this.positionAbs = this._convertPositionTo( "absolute" );
			ui.offset = this.positionAbs;
		}
		return $.Widget.prototype._trigger.call( this, type, event, ui );
	},

	plugins: {},

	_uiHash: function() {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

} );

$.ui.plugin.add( "draggable", "connectToSortable", {
	start: function( event, ui, draggable ) {
		var uiSortable = $.extend( {}, ui, {
			item: draggable.element
		} );

		draggable.sortables = [];
		$( draggable.options.connectToSortable ).each( function() {
			var sortable = $( this ).sortable( "instance" );

			if ( sortable && !sortable.options.disabled ) {
				draggable.sortables.push( sortable );

				// RefreshPositions is called at drag start to refresh the containerCache
				// which is used in drag. This ensures it's initialized and synchronized
				// with any changes that might have happened on the page since initialization.
				sortable.refreshPositions();
				sortable._trigger( "activate", event, uiSortable );
			}
		} );
	},
	stop: function( event, ui, draggable ) {
		var uiSortable = $.extend( {}, ui, {
			item: draggable.element
		} );

		draggable.cancelHelperRemoval = false;

		$.each( draggable.sortables, function() {
			var sortable = this;

			if ( sortable.isOver ) {
				sortable.isOver = 0;

				// Allow this sortable to handle removing the helper
				draggable.cancelHelperRemoval = true;
				sortable.cancelHelperRemoval = false;

				// Use _storedCSS To restore properties in the sortable,
				// as this also handles revert (#9675) since the draggable
				// may have modified them in unexpected ways (#8809)
				sortable._storedCSS = {
					position: sortable.placeholder.css( "position" ),
					top: sortable.placeholder.css( "top" ),
					left: sortable.placeholder.css( "left" )
				};

				sortable._mouseStop( event );

				// Once drag has ended, the sortable should return to using
				// its original helper, not the shared helper from draggable
				sortable.options.helper = sortable.options._helper;
			} else {

				// Prevent this Sortable from removing the helper.
				// However, don't set the draggable to remove the helper
				// either as another connected Sortable may yet handle the removal.
				sortable.cancelHelperRemoval = true;

				sortable._trigger( "deactivate", event, uiSortable );
			}
		} );
	},
	drag: function( event, ui, draggable ) {
		$.each( draggable.sortables, function() {
			var innermostIntersecting = false,
				sortable = this;

			// Copy over variables that sortable's _intersectsWith uses
			sortable.positionAbs = draggable.positionAbs;
			sortable.helperProportions = draggable.helperProportions;
			sortable.offset.click = draggable.offset.click;

			if ( sortable._intersectsWith( sortable.containerCache ) ) {
				innermostIntersecting = true;

				$.each( draggable.sortables, function() {

					// Copy over variables that sortable's _intersectsWith uses
					this.positionAbs = draggable.positionAbs;
					this.helperProportions = draggable.helperProportions;
					this.offset.click = draggable.offset.click;

					if ( this !== sortable &&
							this._intersectsWith( this.containerCache ) &&
							$.contains( sortable.element[ 0 ], this.element[ 0 ] ) ) {
						innermostIntersecting = false;
					}

					return innermostIntersecting;
				} );
			}

			if ( innermostIntersecting ) {

				// If it intersects, we use a little isOver variable and set it once,
				// so that the move-in stuff gets fired only once.
				if ( !sortable.isOver ) {
					sortable.isOver = 1;

					// Store draggable's parent in case we need to reappend to it later.
					draggable._parent = ui.helper.parent();

					sortable.currentItem = ui.helper
						.appendTo( sortable.element )
						.data( "ui-sortable-item", true );

					// Store helper option to later restore it
					sortable.options._helper = sortable.options.helper;

					sortable.options.helper = function() {
						return ui.helper[ 0 ];
					};

					// Fire the start events of the sortable with our passed browser event,
					// and our own helper (so it doesn't create a new one)
					event.target = sortable.currentItem[ 0 ];
					sortable._mouseCapture( event, true );
					sortable._mouseStart( event, true, true );

					// Because the browser event is way off the new appended portlet,
					// modify necessary variables to reflect the changes
					sortable.offset.click.top = draggable.offset.click.top;
					sortable.offset.click.left = draggable.offset.click.left;
					sortable.offset.parent.left -= draggable.offset.parent.left -
						sortable.offset.parent.left;
					sortable.offset.parent.top -= draggable.offset.parent.top -
						sortable.offset.parent.top;

					draggable._trigger( "toSortable", event );

					// Inform draggable that the helper is in a valid drop zone,
					// used solely in the revert option to handle "valid/invalid".
					draggable.dropped = sortable.element;

					// Need to refreshPositions of all sortables in the case that
					// adding to one sortable changes the location of the other sortables (#9675)
					$.each( draggable.sortables, function() {
						this.refreshPositions();
					} );

					// Hack so receive/update callbacks work (mostly)
					draggable.currentItem = draggable.element;
					sortable.fromOutside = draggable;
				}

				if ( sortable.currentItem ) {
					sortable._mouseDrag( event );

					// Copy the sortable's position because the draggable's can potentially reflect
					// a relative position, while sortable is always absolute, which the dragged
					// element has now become. (#8809)
					ui.position = sortable.position;
				}
			} else {

				// If it doesn't intersect with the sortable, and it intersected before,
				// we fake the drag stop of the sortable, but make sure it doesn't remove
				// the helper by using cancelHelperRemoval.
				if ( sortable.isOver ) {

					sortable.isOver = 0;
					sortable.cancelHelperRemoval = true;

					// Calling sortable's mouseStop would trigger a revert,
					// so revert must be temporarily false until after mouseStop is called.
					sortable.options._revert = sortable.options.revert;
					sortable.options.revert = false;

					sortable._trigger( "out", event, sortable._uiHash( sortable ) );
					sortable._mouseStop( event, true );

					// Restore sortable behaviors that were modfied
					// when the draggable entered the sortable area (#9481)
					sortable.options.revert = sortable.options._revert;
					sortable.options.helper = sortable.options._helper;

					if ( sortable.placeholder ) {
						sortable.placeholder.remove();
					}

					// Restore and recalculate the draggable's offset considering the sortable
					// may have modified them in unexpected ways. (#8809, #10669)
					ui.helper.appendTo( draggable._parent );
					draggable._refreshOffsets( event );
					ui.position = draggable._generatePosition( event, true );

					draggable._trigger( "fromSortable", event );

					// Inform draggable that the helper is no longer in a valid drop zone
					draggable.dropped = false;

					// Need to refreshPositions of all sortables just in case removing
					// from one sortable changes the location of other sortables (#9675)
					$.each( draggable.sortables, function() {
						this.refreshPositions();
					} );
				}
			}
		} );
	}
} );

$.ui.plugin.add( "draggable", "cursor", {
	start: function( event, ui, instance ) {
		var t = $( "body" ),
			o = instance.options;

		if ( t.css( "cursor" ) ) {
			o._cursor = t.css( "cursor" );
		}
		t.css( "cursor", o.cursor );
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;
		if ( o._cursor ) {
			$( "body" ).css( "cursor", o._cursor );
		}
	}
} );

$.ui.plugin.add( "draggable", "opacity", {
	start: function( event, ui, instance ) {
		var t = $( ui.helper ),
			o = instance.options;
		if ( t.css( "opacity" ) ) {
			o._opacity = t.css( "opacity" );
		}
		t.css( "opacity", o.opacity );
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;
		if ( o._opacity ) {
			$( ui.helper ).css( "opacity", o._opacity );
		}
	}
} );

$.ui.plugin.add( "draggable", "scroll", {
	start: function( event, ui, i ) {
		if ( !i.scrollParentNotHidden ) {
			i.scrollParentNotHidden = i.helper.scrollParent( false );
		}

		if ( i.scrollParentNotHidden[ 0 ] !== i.document[ 0 ] &&
				i.scrollParentNotHidden[ 0 ].tagName !== "HTML" ) {
			i.overflowOffset = i.scrollParentNotHidden.offset();
		}
	},
	drag: function( event, ui, i  ) {

		var o = i.options,
			scrolled = false,
			scrollParent = i.scrollParentNotHidden[ 0 ],
			document = i.document[ 0 ];

		if ( scrollParent !== document && scrollParent.tagName !== "HTML" ) {
			if ( !o.axis || o.axis !== "x" ) {
				if ( ( i.overflowOffset.top + scrollParent.offsetHeight ) - event.pageY <
						o.scrollSensitivity ) {
					scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;
				} else if ( event.pageY - i.overflowOffset.top < o.scrollSensitivity ) {
					scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;
				}
			}

			if ( !o.axis || o.axis !== "y" ) {
				if ( ( i.overflowOffset.left + scrollParent.offsetWidth ) - event.pageX <
						o.scrollSensitivity ) {
					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;
				} else if ( event.pageX - i.overflowOffset.left < o.scrollSensitivity ) {
					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;
				}
			}

		} else {

			if ( !o.axis || o.axis !== "x" ) {
				if ( event.pageY - $( document ).scrollTop() < o.scrollSensitivity ) {
					scrolled = $( document ).scrollTop( $( document ).scrollTop() - o.scrollSpeed );
				} else if ( $( window ).height() - ( event.pageY - $( document ).scrollTop() ) <
						o.scrollSensitivity ) {
					scrolled = $( document ).scrollTop( $( document ).scrollTop() + o.scrollSpeed );
				}
			}

			if ( !o.axis || o.axis !== "y" ) {
				if ( event.pageX - $( document ).scrollLeft() < o.scrollSensitivity ) {
					scrolled = $( document ).scrollLeft(
						$( document ).scrollLeft() - o.scrollSpeed
					);
				} else if ( $( window ).width() - ( event.pageX - $( document ).scrollLeft() ) <
						o.scrollSensitivity ) {
					scrolled = $( document ).scrollLeft(
						$( document ).scrollLeft() + o.scrollSpeed
					);
				}
			}

		}

		if ( scrolled !== false && $.ui.ddmanager && !o.dropBehaviour ) {
			$.ui.ddmanager.prepareOffsets( i, event );
		}

	}
} );

$.ui.plugin.add( "draggable", "snap", {
	start: function( event, ui, i ) {

		var o = i.options;

		i.snapElements = [];

		$( o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap )
			.each( function() {
				var $t = $( this ),
					$o = $t.offset();
				if ( this !== i.element[ 0 ] ) {
					i.snapElements.push( {
						item: this,
						width: $t.outerWidth(), height: $t.outerHeight(),
						top: $o.top, left: $o.left
					} );
				}
			} );

	},
	drag: function( event, ui, inst ) {

		var ts, bs, ls, rs, l, r, t, b, i, first,
			o = inst.options,
			d = o.snapTolerance,
			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for ( i = inst.snapElements.length - 1; i >= 0; i-- ) {

			l = inst.snapElements[ i ].left - inst.margins.left;
			r = l + inst.snapElements[ i ].width;
			t = inst.snapElements[ i ].top - inst.margins.top;
			b = t + inst.snapElements[ i ].height;

			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d ||
					!$.contains( inst.snapElements[ i ].item.ownerDocument,
					inst.snapElements[ i ].item ) ) {
				if ( inst.snapElements[ i ].snapping ) {
					( inst.options.snap.release &&
						inst.options.snap.release.call(
							inst.element,
							event,
							$.extend( inst._uiHash(), { snapItem: inst.snapElements[ i ].item } )
						) );
				}
				inst.snapElements[ i ].snapping = false;
				continue;
			}

			if ( o.snapMode !== "inner" ) {
				ts = Math.abs( t - y2 ) <= d;
				bs = Math.abs( b - y1 ) <= d;
				ls = Math.abs( l - x2 ) <= d;
				rs = Math.abs( r - x1 ) <= d;
				if ( ts ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: t - inst.helperProportions.height,
						left: 0
					} ).top;
				}
				if ( bs ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: b,
						left: 0
					} ).top;
				}
				if ( ls ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: l - inst.helperProportions.width
					} ).left;
				}
				if ( rs ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: r
					} ).left;
				}
			}

			first = ( ts || bs || ls || rs );

			if ( o.snapMode !== "outer" ) {
				ts = Math.abs( t - y1 ) <= d;
				bs = Math.abs( b - y2 ) <= d;
				ls = Math.abs( l - x1 ) <= d;
				rs = Math.abs( r - x2 ) <= d;
				if ( ts ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: t,
						left: 0
					} ).top;
				}
				if ( bs ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: b - inst.helperProportions.height,
						left: 0
					} ).top;
				}
				if ( ls ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: l
					} ).left;
				}
				if ( rs ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: r - inst.helperProportions.width
					} ).left;
				}
			}

			if ( !inst.snapElements[ i ].snapping && ( ts || bs || ls || rs || first ) ) {
				( inst.options.snap.snap &&
					inst.options.snap.snap.call(
						inst.element,
						event,
						$.extend( inst._uiHash(), {
							snapItem: inst.snapElements[ i ].item
						} ) ) );
			}
			inst.snapElements[ i ].snapping = ( ts || bs || ls || rs || first );

		}

	}
} );

$.ui.plugin.add( "draggable", "stack", {
	start: function( event, ui, instance ) {
		var min,
			o = instance.options,
			group = $.makeArray( $( o.stack ) ).sort( function( a, b ) {
				return ( parseInt( $( a ).css( "zIndex" ), 10 ) || 0 ) -
					( parseInt( $( b ).css( "zIndex" ), 10 ) || 0 );
			} );

		if ( !group.length ) { return; }

		min = parseInt( $( group[ 0 ] ).css( "zIndex" ), 10 ) || 0;
		$( group ).each( function( i ) {
			$( this ).css( "zIndex", min + i );
		} );
		this.css( "zIndex", ( min + group.length ) );
	}
} );

$.ui.plugin.add( "draggable", "zIndex", {
	start: function( event, ui, instance ) {
		var t = $( ui.helper ),
			o = instance.options;

		if ( t.css( "zIndex" ) ) {
			o._zIndex = t.css( "zIndex" );
		}
		t.css( "zIndex", o.zIndex );
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;

		if ( o._zIndex ) {
			$( ui.helper ).css( "zIndex", o._zIndex );
		}
	}
} );

return $.ui.draggable;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/mouse.js":
/*!****************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/mouse.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Mouse 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Mouse
//>>group: Widgets
//>>description: Abstracts mouse-based interactions to assist in creating certain widgets.
//>>docs: http://api.jqueryui.com/mouse/

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ../ie */ "./node_modules/jquery-ui/ui/ie.js"),
			__webpack_require__(/*! ../version */ "./node_modules/jquery-ui/ui/version.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

var mouseHandled = false;
$( document ).on( "mouseup", function() {
	mouseHandled = false;
} );

return $.widget( "ui.mouse", {
	version: "1.12.1",
	options: {
		cancel: "input, textarea, button, select, option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.on( "mousedown." + this.widgetName, function( event ) {
				return that._mouseDown( event );
			} )
			.on( "click." + this.widgetName, function( event ) {
				if ( true === $.data( event.target, that.widgetName + ".preventClickEvent" ) ) {
					$.removeData( event.target, that.widgetName + ".preventClickEvent" );
					event.stopImmediatePropagation();
					return false;
				}
			} );

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.off( "." + this.widgetName );
		if ( this._mouseMoveDelegate ) {
			this.document
				.off( "mousemove." + this.widgetName, this._mouseMoveDelegate )
				.off( "mouseup." + this.widgetName, this._mouseUpDelegate );
		}
	},

	_mouseDown: function( event ) {

		// don't let more than one widget handle mouseStart
		if ( mouseHandled ) {
			return;
		}

		this._mouseMoved = false;

		// We may have missed mouseup (out of window)
		( this._mouseStarted && this._mouseUp( event ) );

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = ( event.which === 1 ),

			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = ( typeof this.options.cancel === "string" && event.target.nodeName ?
				$( event.target ).closest( this.options.cancel ).length : false );
		if ( !btnIsLeft || elIsCancel || !this._mouseCapture( event ) ) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if ( !this.mouseDelayMet ) {
			this._mouseDelayTimer = setTimeout( function() {
				that.mouseDelayMet = true;
			}, this.options.delay );
		}

		if ( this._mouseDistanceMet( event ) && this._mouseDelayMet( event ) ) {
			this._mouseStarted = ( this._mouseStart( event ) !== false );
			if ( !this._mouseStarted ) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if ( true === $.data( event.target, this.widgetName + ".preventClickEvent" ) ) {
			$.removeData( event.target, this.widgetName + ".preventClickEvent" );
		}

		// These delegates are required to keep context
		this._mouseMoveDelegate = function( event ) {
			return that._mouseMove( event );
		};
		this._mouseUpDelegate = function( event ) {
			return that._mouseUp( event );
		};

		this.document
			.on( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.on( "mouseup." + this.widgetName, this._mouseUpDelegate );

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function( event ) {

		// Only check for mouseups outside the document if you've moved inside the document
		// at least once. This prevents the firing of mouseup in the case of IE<9, which will
		// fire a mousemove event if content is placed under the cursor. See #7778
		// Support: IE <9
		if ( this._mouseMoved ) {

			// IE mouseup check - mouseup happened when mouse was out of window
			if ( $.ui.ie && ( !document.documentMode || document.documentMode < 9 ) &&
					!event.button ) {
				return this._mouseUp( event );

			// Iframe mouseup check - mouseup occurred in another document
			} else if ( !event.which ) {

				// Support: Safari <=8 - 9
				// Safari sets which to 0 if you press any of the following keys
				// during a drag (#14461)
				if ( event.originalEvent.altKey || event.originalEvent.ctrlKey ||
						event.originalEvent.metaKey || event.originalEvent.shiftKey ) {
					this.ignoreMissingWhich = true;
				} else if ( !this.ignoreMissingWhich ) {
					return this._mouseUp( event );
				}
			}
		}

		if ( event.which || event.button ) {
			this._mouseMoved = true;
		}

		if ( this._mouseStarted ) {
			this._mouseDrag( event );
			return event.preventDefault();
		}

		if ( this._mouseDistanceMet( event ) && this._mouseDelayMet( event ) ) {
			this._mouseStarted =
				( this._mouseStart( this._mouseDownEvent, event ) !== false );
			( this._mouseStarted ? this._mouseDrag( event ) : this._mouseUp( event ) );
		}

		return !this._mouseStarted;
	},

	_mouseUp: function( event ) {
		this.document
			.off( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.off( "mouseup." + this.widgetName, this._mouseUpDelegate );

		if ( this._mouseStarted ) {
			this._mouseStarted = false;

			if ( event.target === this._mouseDownEvent.target ) {
				$.data( event.target, this.widgetName + ".preventClickEvent", true );
			}

			this._mouseStop( event );
		}

		if ( this._mouseDelayTimer ) {
			clearTimeout( this._mouseDelayTimer );
			delete this._mouseDelayTimer;
		}

		this.ignoreMissingWhich = false;
		mouseHandled = false;
		event.preventDefault();
	},

	_mouseDistanceMet: function( event ) {
		return ( Math.max(
				Math.abs( this._mouseDownEvent.pageX - event.pageX ),
				Math.abs( this._mouseDownEvent.pageY - event.pageY )
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function( /* event */ ) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function( /* event */ ) {},
	_mouseDrag: function( /* event */ ) {},
	_mouseStop: function( /* event */ ) {},
	_mouseCapture: function( /* event */ ) { return true; }
} );

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/resizable.js":
/*!********************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/resizable.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Resizable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Resizable
//>>group: Interactions
//>>description: Enables resize functionality for any element.
//>>docs: http://api.jqueryui.com/resizable/
//>>demos: http://jqueryui.com/resizable/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/resizable.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ./mouse */ "./node_modules/jquery-ui/ui/widgets/mouse.js"),
			__webpack_require__(/*! ../disable-selection */ "./node_modules/jquery-ui/ui/disable-selection.js"),
			__webpack_require__(/*! ../plugin */ "./node_modules/jquery-ui/ui/plugin.js"),
			__webpack_require__(/*! ../version */ "./node_modules/jquery-ui/ui/version.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

$.widget( "ui.resizable", $.ui.mouse, {
	version: "1.12.1",
	widgetEventPrefix: "resize",
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		classes: {
			"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se"
		},
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,

		// See #7960
		zIndex: 90,

		// Callbacks
		resize: null,
		start: null,
		stop: null
	},

	_num: function( value ) {
		return parseFloat( value ) || 0;
	},

	_isNumber: function( value ) {
		return !isNaN( parseFloat( value ) );
	},

	_hasScroll: function( el, a ) {

		if ( $( el ).css( "overflow" ) === "hidden" ) {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},

	_create: function() {

		var margins,
			o = this.options,
			that = this;
		this._addClass( "ui-resizable" );

		$.extend( this, {
			_aspectRatio: !!( o.aspectRatio ),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
		} );

		// Wrap the element if it cannot hold child nodes
		if ( this.element[ 0 ].nodeName.match( /^(canvas|textarea|input|select|button|img)$/i ) ) {

			this.element.wrap(
				$( "<div class='ui-wrapper' style='overflow: hidden;'></div>" ).css( {
					position: this.element.css( "position" ),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css( "top" ),
					left: this.element.css( "left" )
				} )
			);

			this.element = this.element.parent().data(
				"ui-resizable", this.element.resizable( "instance" )
			);

			this.elementIsWrapper = true;

			margins = {
				marginTop: this.originalElement.css( "marginTop" ),
				marginRight: this.originalElement.css( "marginRight" ),
				marginBottom: this.originalElement.css( "marginBottom" ),
				marginLeft: this.originalElement.css( "marginLeft" )
			};

			this.element.css( margins );
			this.originalElement.css( "margin", 0 );

			// support: Safari
			// Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css( "resize" );
			this.originalElement.css( "resize", "none" );

			this._proportionallyResizeElements.push( this.originalElement.css( {
				position: "static",
				zoom: 1,
				display: "block"
			} ) );

			// Support: IE9
			// avoid IE jump (hard set the margin)
			this.originalElement.css( margins );

			this._proportionallyResize();
		}

		this._setupHandles();

		if ( o.autoHide ) {
			$( this.element )
				.on( "mouseenter", function() {
					if ( o.disabled ) {
						return;
					}
					that._removeClass( "ui-resizable-autohide" );
					that._handles.show();
				} )
				.on( "mouseleave", function() {
					if ( o.disabled ) {
						return;
					}
					if ( !that.resizing ) {
						that._addClass( "ui-resizable-autohide" );
						that._handles.hide();
					}
				} );
		}

		this._mouseInit();
	},

	_destroy: function() {

		this._mouseDestroy();

		var wrapper,
			_destroy = function( exp ) {
				$( exp )
					.removeData( "resizable" )
					.removeData( "ui-resizable" )
					.off( ".resizable" )
					.find( ".ui-resizable-handle" )
						.remove();
			};

		// TODO: Unwrap at same DOM position
		if ( this.elementIsWrapper ) {
			_destroy( this.element );
			wrapper = this.element;
			this.originalElement.css( {
				position: wrapper.css( "position" ),
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight(),
				top: wrapper.css( "top" ),
				left: wrapper.css( "left" )
			} ).insertAfter( wrapper );
			wrapper.remove();
		}

		this.originalElement.css( "resize", this.originalResizeStyle );
		_destroy( this.originalElement );

		return this;
	},

	_setOption: function( key, value ) {
		this._super( key, value );

		switch ( key ) {
		case "handles":
			this._removeHandles();
			this._setupHandles();
			break;
		default:
			break;
		}
	},

	_setupHandles: function() {
		var o = this.options, handle, i, n, hname, axis, that = this;
		this.handles = o.handles ||
			( !$( ".ui-resizable-handle", this.element ).length ?
				"e,s,se" : {
					n: ".ui-resizable-n",
					e: ".ui-resizable-e",
					s: ".ui-resizable-s",
					w: ".ui-resizable-w",
					se: ".ui-resizable-se",
					sw: ".ui-resizable-sw",
					ne: ".ui-resizable-ne",
					nw: ".ui-resizable-nw"
				} );

		this._handles = $();
		if ( this.handles.constructor === String ) {

			if ( this.handles === "all" ) {
				this.handles = "n,e,s,w,se,sw,ne,nw";
			}

			n = this.handles.split( "," );
			this.handles = {};

			for ( i = 0; i < n.length; i++ ) {

				handle = $.trim( n[ i ] );
				hname = "ui-resizable-" + handle;
				axis = $( "<div>" );
				this._addClass( axis, "ui-resizable-handle " + hname );

				axis.css( { zIndex: o.zIndex } );

				this.handles[ handle ] = ".ui-resizable-" + handle;
				this.element.append( axis );
			}

		}

		this._renderAxis = function( target ) {

			var i, axis, padPos, padWrapper;

			target = target || this.element;

			for ( i in this.handles ) {

				if ( this.handles[ i ].constructor === String ) {
					this.handles[ i ] = this.element.children( this.handles[ i ] ).first().show();
				} else if ( this.handles[ i ].jquery || this.handles[ i ].nodeType ) {
					this.handles[ i ] = $( this.handles[ i ] );
					this._on( this.handles[ i ], { "mousedown": that._mouseDown } );
				}

				if ( this.elementIsWrapper &&
						this.originalElement[ 0 ]
							.nodeName
							.match( /^(textarea|input|select|button)$/i ) ) {
					axis = $( this.handles[ i ], this.element );

					padWrapper = /sw|ne|nw|se|n|s/.test( i ) ?
						axis.outerHeight() :
						axis.outerWidth();

					padPos = [ "padding",
						/ne|nw|n/.test( i ) ? "Top" :
						/se|sw|s/.test( i ) ? "Bottom" :
						/^e$/.test( i ) ? "Right" : "Left" ].join( "" );

					target.css( padPos, padWrapper );

					this._proportionallyResize();
				}

				this._handles = this._handles.add( this.handles[ i ] );
			}
		};

		// TODO: make renderAxis a prototype function
		this._renderAxis( this.element );

		this._handles = this._handles.add( this.element.find( ".ui-resizable-handle" ) );
		this._handles.disableSelection();

		this._handles.on( "mouseover", function() {
			if ( !that.resizing ) {
				if ( this.className ) {
					axis = this.className.match( /ui-resizable-(se|sw|ne|nw|n|e|s|w)/i );
				}
				that.axis = axis && axis[ 1 ] ? axis[ 1 ] : "se";
			}
		} );

		if ( o.autoHide ) {
			this._handles.hide();
			this._addClass( "ui-resizable-autohide" );
		}
	},

	_removeHandles: function() {
		this._handles.remove();
	},

	_mouseCapture: function( event ) {
		var i, handle,
			capture = false;

		for ( i in this.handles ) {
			handle = $( this.handles[ i ] )[ 0 ];
			if ( handle === event.target || $.contains( handle, event.target ) ) {
				capture = true;
			}
		}

		return !this.options.disabled && capture;
	},

	_mouseStart: function( event ) {

		var curleft, curtop, cursor,
			o = this.options,
			el = this.element;

		this.resizing = true;

		this._renderProxy();

		curleft = this._num( this.helper.css( "left" ) );
		curtop = this._num( this.helper.css( "top" ) );

		if ( o.containment ) {
			curleft += $( o.containment ).scrollLeft() || 0;
			curtop += $( o.containment ).scrollTop() || 0;
		}

		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };

		this.size = this._helper ? {
				width: this.helper.width(),
				height: this.helper.height()
			} : {
				width: el.width(),
				height: el.height()
			};

		this.originalSize = this._helper ? {
				width: el.outerWidth(),
				height: el.outerHeight()
			} : {
				width: el.width(),
				height: el.height()
			};

		this.sizeDiff = {
			width: el.outerWidth() - el.width(),
			height: el.outerHeight() - el.height()
		};

		this.originalPosition = { left: curleft, top: curtop };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		this.aspectRatio = ( typeof o.aspectRatio === "number" ) ?
			o.aspectRatio :
			( ( this.originalSize.width / this.originalSize.height ) || 1 );

		cursor = $( ".ui-resizable-" + this.axis ).css( "cursor" );
		$( "body" ).css( "cursor", cursor === "auto" ? this.axis + "-resize" : cursor );

		this._addClass( "ui-resizable-resizing" );
		this._propagate( "start", event );
		return true;
	},

	_mouseDrag: function( event ) {

		var data, props,
			smp = this.originalMousePosition,
			a = this.axis,
			dx = ( event.pageX - smp.left ) || 0,
			dy = ( event.pageY - smp.top ) || 0,
			trigger = this._change[ a ];

		this._updatePrevProperties();

		if ( !trigger ) {
			return false;
		}

		data = trigger.apply( this, [ event, dx, dy ] );

		this._updateVirtualBoundaries( event.shiftKey );
		if ( this._aspectRatio || event.shiftKey ) {
			data = this._updateRatio( data, event );
		}

		data = this._respectSize( data, event );

		this._updateCache( data );

		this._propagate( "resize", event );

		props = this._applyChanges();

		if ( !this._helper && this._proportionallyResizeElements.length ) {
			this._proportionallyResize();
		}

		if ( !$.isEmptyObject( props ) ) {
			this._updatePrevProperties();
			this._trigger( "resize", event, this.ui() );
			this._applyChanges();
		}

		return false;
	},

	_mouseStop: function( event ) {

		this.resizing = false;
		var pr, ista, soffseth, soffsetw, s, left, top,
			o = this.options, that = this;

		if ( this._helper ) {

			pr = this._proportionallyResizeElements;
			ista = pr.length && ( /textarea/i ).test( pr[ 0 ].nodeName );
			soffseth = ista && this._hasScroll( pr[ 0 ], "left" ) ? 0 : that.sizeDiff.height;
			soffsetw = ista ? 0 : that.sizeDiff.width;

			s = {
				width: ( that.helper.width()  - soffsetw ),
				height: ( that.helper.height() - soffseth )
			};
			left = ( parseFloat( that.element.css( "left" ) ) +
				( that.position.left - that.originalPosition.left ) ) || null;
			top = ( parseFloat( that.element.css( "top" ) ) +
				( that.position.top - that.originalPosition.top ) ) || null;

			if ( !o.animate ) {
				this.element.css( $.extend( s, { top: top, left: left } ) );
			}

			that.helper.height( that.size.height );
			that.helper.width( that.size.width );

			if ( this._helper && !o.animate ) {
				this._proportionallyResize();
			}
		}

		$( "body" ).css( "cursor", "auto" );

		this._removeClass( "ui-resizable-resizing" );

		this._propagate( "stop", event );

		if ( this._helper ) {
			this.helper.remove();
		}

		return false;

	},

	_updatePrevProperties: function() {
		this.prevPosition = {
			top: this.position.top,
			left: this.position.left
		};
		this.prevSize = {
			width: this.size.width,
			height: this.size.height
		};
	},

	_applyChanges: function() {
		var props = {};

		if ( this.position.top !== this.prevPosition.top ) {
			props.top = this.position.top + "px";
		}
		if ( this.position.left !== this.prevPosition.left ) {
			props.left = this.position.left + "px";
		}
		if ( this.size.width !== this.prevSize.width ) {
			props.width = this.size.width + "px";
		}
		if ( this.size.height !== this.prevSize.height ) {
			props.height = this.size.height + "px";
		}

		this.helper.css( props );

		return props;
	},

	_updateVirtualBoundaries: function( forceAspectRatio ) {
		var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
			o = this.options;

		b = {
			minWidth: this._isNumber( o.minWidth ) ? o.minWidth : 0,
			maxWidth: this._isNumber( o.maxWidth ) ? o.maxWidth : Infinity,
			minHeight: this._isNumber( o.minHeight ) ? o.minHeight : 0,
			maxHeight: this._isNumber( o.maxHeight ) ? o.maxHeight : Infinity
		};

		if ( this._aspectRatio || forceAspectRatio ) {
			pMinWidth = b.minHeight * this.aspectRatio;
			pMinHeight = b.minWidth / this.aspectRatio;
			pMaxWidth = b.maxHeight * this.aspectRatio;
			pMaxHeight = b.maxWidth / this.aspectRatio;

			if ( pMinWidth > b.minWidth ) {
				b.minWidth = pMinWidth;
			}
			if ( pMinHeight > b.minHeight ) {
				b.minHeight = pMinHeight;
			}
			if ( pMaxWidth < b.maxWidth ) {
				b.maxWidth = pMaxWidth;
			}
			if ( pMaxHeight < b.maxHeight ) {
				b.maxHeight = pMaxHeight;
			}
		}
		this._vBoundaries = b;
	},

	_updateCache: function( data ) {
		this.offset = this.helper.offset();
		if ( this._isNumber( data.left ) ) {
			this.position.left = data.left;
		}
		if ( this._isNumber( data.top ) ) {
			this.position.top = data.top;
		}
		if ( this._isNumber( data.height ) ) {
			this.size.height = data.height;
		}
		if ( this._isNumber( data.width ) ) {
			this.size.width = data.width;
		}
	},

	_updateRatio: function( data ) {

		var cpos = this.position,
			csize = this.size,
			a = this.axis;

		if ( this._isNumber( data.height ) ) {
			data.width = ( data.height * this.aspectRatio );
		} else if ( this._isNumber( data.width ) ) {
			data.height = ( data.width / this.aspectRatio );
		}

		if ( a === "sw" ) {
			data.left = cpos.left + ( csize.width - data.width );
			data.top = null;
		}
		if ( a === "nw" ) {
			data.top = cpos.top + ( csize.height - data.height );
			data.left = cpos.left + ( csize.width - data.width );
		}

		return data;
	},

	_respectSize: function( data ) {

		var o = this._vBoundaries,
			a = this.axis,
			ismaxw = this._isNumber( data.width ) && o.maxWidth && ( o.maxWidth < data.width ),
			ismaxh = this._isNumber( data.height ) && o.maxHeight && ( o.maxHeight < data.height ),
			isminw = this._isNumber( data.width ) && o.minWidth && ( o.minWidth > data.width ),
			isminh = this._isNumber( data.height ) && o.minHeight && ( o.minHeight > data.height ),
			dw = this.originalPosition.left + this.originalSize.width,
			dh = this.originalPosition.top + this.originalSize.height,
			cw = /sw|nw|w/.test( a ), ch = /nw|ne|n/.test( a );
		if ( isminw ) {
			data.width = o.minWidth;
		}
		if ( isminh ) {
			data.height = o.minHeight;
		}
		if ( ismaxw ) {
			data.width = o.maxWidth;
		}
		if ( ismaxh ) {
			data.height = o.maxHeight;
		}

		if ( isminw && cw ) {
			data.left = dw - o.minWidth;
		}
		if ( ismaxw && cw ) {
			data.left = dw - o.maxWidth;
		}
		if ( isminh && ch ) {
			data.top = dh - o.minHeight;
		}
		if ( ismaxh && ch ) {
			data.top = dh - o.maxHeight;
		}

		// Fixing jump error on top/left - bug #2330
		if ( !data.width && !data.height && !data.left && data.top ) {
			data.top = null;
		} else if ( !data.width && !data.height && !data.top && data.left ) {
			data.left = null;
		}

		return data;
	},

	_getPaddingPlusBorderDimensions: function( element ) {
		var i = 0,
			widths = [],
			borders = [
				element.css( "borderTopWidth" ),
				element.css( "borderRightWidth" ),
				element.css( "borderBottomWidth" ),
				element.css( "borderLeftWidth" )
			],
			paddings = [
				element.css( "paddingTop" ),
				element.css( "paddingRight" ),
				element.css( "paddingBottom" ),
				element.css( "paddingLeft" )
			];

		for ( ; i < 4; i++ ) {
			widths[ i ] = ( parseFloat( borders[ i ] ) || 0 );
			widths[ i ] += ( parseFloat( paddings[ i ] ) || 0 );
		}

		return {
			height: widths[ 0 ] + widths[ 2 ],
			width: widths[ 1 ] + widths[ 3 ]
		};
	},

	_proportionallyResize: function() {

		if ( !this._proportionallyResizeElements.length ) {
			return;
		}

		var prel,
			i = 0,
			element = this.helper || this.element;

		for ( ; i < this._proportionallyResizeElements.length; i++ ) {

			prel = this._proportionallyResizeElements[ i ];

			// TODO: Seems like a bug to cache this.outerDimensions
			// considering that we are in a loop.
			if ( !this.outerDimensions ) {
				this.outerDimensions = this._getPaddingPlusBorderDimensions( prel );
			}

			prel.css( {
				height: ( element.height() - this.outerDimensions.height ) || 0,
				width: ( element.width() - this.outerDimensions.width ) || 0
			} );

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if ( this._helper ) {

			this.helper = this.helper || $( "<div style='overflow:hidden;'></div>" );

			this._addClass( this.helper, this._helper );
			this.helper.css( {
				width: this.element.outerWidth(),
				height: this.element.outerHeight(),
				position: "absolute",
				left: this.elementOffset.left + "px",
				top: this.elementOffset.top + "px",
				zIndex: ++o.zIndex //TODO: Don't modify option
			} );

			this.helper
				.appendTo( "body" )
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function( event, dx ) {
			return { width: this.originalSize.width + dx };
		},
		w: function( event, dx ) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function( event, dx, dy ) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function( event, dx, dy ) {
			return { height: this.originalSize.height + dy };
		},
		se: function( event, dx, dy ) {
			return $.extend( this._change.s.apply( this, arguments ),
				this._change.e.apply( this, [ event, dx, dy ] ) );
		},
		sw: function( event, dx, dy ) {
			return $.extend( this._change.s.apply( this, arguments ),
				this._change.w.apply( this, [ event, dx, dy ] ) );
		},
		ne: function( event, dx, dy ) {
			return $.extend( this._change.n.apply( this, arguments ),
				this._change.e.apply( this, [ event, dx, dy ] ) );
		},
		nw: function( event, dx, dy ) {
			return $.extend( this._change.n.apply( this, arguments ),
				this._change.w.apply( this, [ event, dx, dy ] ) );
		}
	},

	_propagate: function( n, event ) {
		$.ui.plugin.call( this, n, [ event, this.ui() ] );
		( n !== "resize" && this._trigger( n, event, this.ui() ) );
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

} );

/*
 * Resizable Extensions
 */

$.ui.plugin.add( "resizable", "animate", {

	stop: function( event ) {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			pr = that._proportionallyResizeElements,
			ista = pr.length && ( /textarea/i ).test( pr[ 0 ].nodeName ),
			soffseth = ista && that._hasScroll( pr[ 0 ], "left" ) ? 0 : that.sizeDiff.height,
			soffsetw = ista ? 0 : that.sizeDiff.width,
			style = {
				width: ( that.size.width - soffsetw ),
				height: ( that.size.height - soffseth )
			},
			left = ( parseFloat( that.element.css( "left" ) ) +
				( that.position.left - that.originalPosition.left ) ) || null,
			top = ( parseFloat( that.element.css( "top" ) ) +
				( that.position.top - that.originalPosition.top ) ) || null;

		that.element.animate(
			$.extend( style, top && left ? { top: top, left: left } : {} ), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseFloat( that.element.css( "width" ) ),
						height: parseFloat( that.element.css( "height" ) ),
						top: parseFloat( that.element.css( "top" ) ),
						left: parseFloat( that.element.css( "left" ) )
					};

					if ( pr && pr.length ) {
						$( pr[ 0 ] ).css( { width: data.width, height: data.height } );
					}

					// Propagating resize, and updating values for each animation step
					that._updateCache( data );
					that._propagate( "resize", event );

				}
			}
		);
	}

} );

$.ui.plugin.add( "resizable", "containment", {

	start: function() {
		var element, p, co, ch, cw, width, height,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			el = that.element,
			oc = o.containment,
			ce = ( oc instanceof $ ) ?
				oc.get( 0 ) :
				( /parent/.test( oc ) ) ? el.parent().get( 0 ) : oc;

		if ( !ce ) {
			return;
		}

		that.containerElement = $( ce );

		if ( /document/.test( oc ) || oc === document ) {
			that.containerOffset = {
				left: 0,
				top: 0
			};
			that.containerPosition = {
				left: 0,
				top: 0
			};

			that.parentData = {
				element: $( document ),
				left: 0,
				top: 0,
				width: $( document ).width(),
				height: $( document ).height() || document.body.parentNode.scrollHeight
			};
		} else {
			element = $( ce );
			p = [];
			$( [ "Top", "Right", "Left", "Bottom" ] ).each( function( i, name ) {
				p[ i ] = that._num( element.css( "padding" + name ) );
			} );

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = {
				height: ( element.innerHeight() - p[ 3 ] ),
				width: ( element.innerWidth() - p[ 1 ] )
			};

			co = that.containerOffset;
			ch = that.containerSize.height;
			cw = that.containerSize.width;
			width = ( that._hasScroll ( ce, "left" ) ? ce.scrollWidth : cw );
			height = ( that._hasScroll ( ce ) ? ce.scrollHeight : ch ) ;

			that.parentData = {
				element: ce,
				left: co.left,
				top: co.top,
				width: width,
				height: height
			};
		}
	},

	resize: function( event ) {
		var woset, hoset, isParent, isOffsetRelative,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey,
			cop = {
				top: 0,
				left: 0
			},
			ce = that.containerElement,
			continueResize = true;

		if ( ce[ 0 ] !== document && ( /static/ ).test( ce.css( "position" ) ) ) {
			cop = co;
		}

		if ( cp.left < ( that._helper ? co.left : 0 ) ) {
			that.size.width = that.size.width +
				( that._helper ?
					( that.position.left - co.left ) :
					( that.position.left - cop.left ) );

			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
			that.position.left = o.helper ? co.left : 0;
		}

		if ( cp.top < ( that._helper ? co.top : 0 ) ) {
			that.size.height = that.size.height +
				( that._helper ?
					( that.position.top - co.top ) :
					that.position.top );

			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
			that.position.top = that._helper ? co.top : 0;
		}

		isParent = that.containerElement.get( 0 ) === that.element.parent().get( 0 );
		isOffsetRelative = /relative|absolute/.test( that.containerElement.css( "position" ) );

		if ( isParent && isOffsetRelative ) {
			that.offset.left = that.parentData.left + that.position.left;
			that.offset.top = that.parentData.top + that.position.top;
		} else {
			that.offset.left = that.element.offset().left;
			that.offset.top = that.element.offset().top;
		}

		woset = Math.abs( that.sizeDiff.width +
			( that._helper ?
				that.offset.left - cop.left :
				( that.offset.left - co.left ) ) );

		hoset = Math.abs( that.sizeDiff.height +
			( that._helper ?
				that.offset.top - cop.top :
				( that.offset.top - co.top ) ) );

		if ( woset + that.size.width >= that.parentData.width ) {
			that.size.width = that.parentData.width - woset;
			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
		}

		if ( hoset + that.size.height >= that.parentData.height ) {
			that.size.height = that.parentData.height - hoset;
			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
		}

		if ( !continueResize ) {
			that.position.left = that.prevPosition.left;
			that.position.top = that.prevPosition.top;
			that.size.width = that.prevSize.width;
			that.size.height = that.prevSize.height;
		}
	},

	stop: function() {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cop = that.containerPosition,
			ce = that.containerElement,
			helper = $( that.helper ),
			ho = helper.offset(),
			w = helper.outerWidth() - that.sizeDiff.width,
			h = helper.outerHeight() - that.sizeDiff.height;

		if ( that._helper && !o.animate && ( /relative/ ).test( ce.css( "position" ) ) ) {
			$( this ).css( {
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			} );
		}

		if ( that._helper && !o.animate && ( /static/ ).test( ce.css( "position" ) ) ) {
			$( this ).css( {
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			} );
		}
	}
} );

$.ui.plugin.add( "resizable", "alsoResize", {

	start: function() {
		var that = $( this ).resizable( "instance" ),
			o = that.options;

		$( o.alsoResize ).each( function() {
			var el = $( this );
			el.data( "ui-resizable-alsoresize", {
				width: parseFloat( el.width() ), height: parseFloat( el.height() ),
				left: parseFloat( el.css( "left" ) ), top: parseFloat( el.css( "top" ) )
			} );
		} );
	},

	resize: function( event, ui ) {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: ( that.size.height - os.height ) || 0,
				width: ( that.size.width - os.width ) || 0,
				top: ( that.position.top - op.top ) || 0,
				left: ( that.position.left - op.left ) || 0
			};

			$( o.alsoResize ).each( function() {
				var el = $( this ), start = $( this ).data( "ui-resizable-alsoresize" ), style = {},
					css = el.parents( ui.originalElement[ 0 ] ).length ?
							[ "width", "height" ] :
							[ "width", "height", "top", "left" ];

				$.each( css, function( i, prop ) {
					var sum = ( start[ prop ] || 0 ) + ( delta[ prop ] || 0 );
					if ( sum && sum >= 0 ) {
						style[ prop ] = sum || null;
					}
				} );

				el.css( style );
			} );
	},

	stop: function() {
		$( this ).removeData( "ui-resizable-alsoresize" );
	}
} );

$.ui.plugin.add( "resizable", "ghost", {

	start: function() {

		var that = $( this ).resizable( "instance" ), cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost.css( {
			opacity: 0.25,
			display: "block",
			position: "relative",
			height: cs.height,
			width: cs.width,
			margin: 0,
			left: 0,
			top: 0
		} );

		that._addClass( that.ghost, "ui-resizable-ghost" );

		// DEPRECATED
		// TODO: remove after 1.12
		if ( $.uiBackCompat !== false && typeof that.options.ghost === "string" ) {

			// Ghost option
			that.ghost.addClass( this.options.ghost );
		}

		that.ghost.appendTo( that.helper );

	},

	resize: function() {
		var that = $( this ).resizable( "instance" );
		if ( that.ghost ) {
			that.ghost.css( {
				position: "relative",
				height: that.size.height,
				width: that.size.width
			} );
		}
	},

	stop: function() {
		var that = $( this ).resizable( "instance" );
		if ( that.ghost && that.helper ) {
			that.helper.get( 0 ).removeChild( that.ghost.get( 0 ) );
		}
	}

} );

$.ui.plugin.add( "resizable", "grid", {

	resize: function() {
		var outerDimensions,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			cs = that.size,
			os = that.originalSize,
			op = that.originalPosition,
			a = that.axis,
			grid = typeof o.grid === "number" ? [ o.grid, o.grid ] : o.grid,
			gridX = ( grid[ 0 ] || 1 ),
			gridY = ( grid[ 1 ] || 1 ),
			ox = Math.round( ( cs.width - os.width ) / gridX ) * gridX,
			oy = Math.round( ( cs.height - os.height ) / gridY ) * gridY,
			newWidth = os.width + ox,
			newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && ( o.maxWidth < newWidth ),
			isMaxHeight = o.maxHeight && ( o.maxHeight < newHeight ),
			isMinWidth = o.minWidth && ( o.minWidth > newWidth ),
			isMinHeight = o.minHeight && ( o.minHeight > newHeight );

		o.grid = grid;

		if ( isMinWidth ) {
			newWidth += gridX;
		}
		if ( isMinHeight ) {
			newHeight += gridY;
		}
		if ( isMaxWidth ) {
			newWidth -= gridX;
		}
		if ( isMaxHeight ) {
			newHeight -= gridY;
		}

		if ( /^(se|s|e)$/.test( a ) ) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if ( /^(ne)$/.test( a ) ) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if ( /^(sw)$/.test( a ) ) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			if ( newHeight - gridY <= 0 || newWidth - gridX <= 0 ) {
				outerDimensions = that._getPaddingPlusBorderDimensions( this );
			}

			if ( newHeight - gridY > 0 ) {
				that.size.height = newHeight;
				that.position.top = op.top - oy;
			} else {
				newHeight = gridY - outerDimensions.height;
				that.size.height = newHeight;
				that.position.top = op.top + os.height - newHeight;
			}
			if ( newWidth - gridX > 0 ) {
				that.size.width = newWidth;
				that.position.left = op.left - ox;
			} else {
				newWidth = gridX - outerDimensions.width;
				that.size.width = newWidth;
				that.position.left = op.left + os.width - newWidth;
			}
		}
	}

} );

return $.ui.resizable;

} ) );


/***/ }),

/***/ "./node_modules/jquery-ui/ui/widgets/tabs.js":
/*!***************************************************!*\
  !*** ./node_modules/jquery-ui/ui/widgets/tabs.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery UI Tabs 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Tabs
//>>group: Widgets
//>>description: Transforms a set of container elements into a tab structure.
//>>docs: http://api.jqueryui.com/tabs/
//>>demos: http://jqueryui.com/tabs/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/tabs.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( true ) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
			__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js"),
			__webpack_require__(/*! ../escape-selector */ "./node_modules/jquery-ui/ui/escape-selector.js"),
			__webpack_require__(/*! ../keycode */ "./node_modules/jquery-ui/ui/keycode.js"),
			__webpack_require__(/*! ../safe-active-element */ "./node_modules/jquery-ui/ui/safe-active-element.js"),
			__webpack_require__(/*! ../unique-id */ "./node_modules/jquery-ui/ui/unique-id.js"),
			__webpack_require__(/*! ../version */ "./node_modules/jquery-ui/ui/version.js"),
			__webpack_require__(/*! ../widget */ "./node_modules/jquery-ui/ui/widget.js")
		], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}( function( $ ) {

$.widget( "ui.tabs", {
	version: "1.12.1",
	delay: 300,
	options: {
		active: null,
		classes: {
			"ui-tabs": "ui-corner-all",
			"ui-tabs-nav": "ui-corner-all",
			"ui-tabs-panel": "ui-corner-bottom",
			"ui-tabs-tab": "ui-corner-top"
		},
		collapsible: false,
		event: "click",
		heightStyle: "content",
		hide: null,
		show: null,

		// Callbacks
		activate: null,
		beforeActivate: null,
		beforeLoad: null,
		load: null
	},

	_isLocal: ( function() {
		var rhash = /#.*$/;

		return function( anchor ) {
			var anchorUrl, locationUrl;

			anchorUrl = anchor.href.replace( rhash, "" );
			locationUrl = location.href.replace( rhash, "" );

			// Decoding may throw an error if the URL isn't UTF-8 (#9518)
			try {
				anchorUrl = decodeURIComponent( anchorUrl );
			} catch ( error ) {}
			try {
				locationUrl = decodeURIComponent( locationUrl );
			} catch ( error ) {}

			return anchor.hash.length > 1 && anchorUrl === locationUrl;
		};
	} )(),

	_create: function() {
		var that = this,
			options = this.options;

		this.running = false;

		this._addClass( "ui-tabs", "ui-widget ui-widget-content" );
		this._toggleClass( "ui-tabs-collapsible", null, options.collapsible );

		this._processTabs();
		options.active = this._initialActive();

		// Take disabling tabs via class attribute from HTML
		// into account and update option properly.
		if ( $.isArray( options.disabled ) ) {
			options.disabled = $.unique( options.disabled.concat(
				$.map( this.tabs.filter( ".ui-state-disabled" ), function( li ) {
					return that.tabs.index( li );
				} )
			) ).sort();
		}

		// Check for length avoids error when initializing empty list
		if ( this.options.active !== false && this.anchors.length ) {
			this.active = this._findActive( options.active );
		} else {
			this.active = $();
		}

		this._refresh();

		if ( this.active.length ) {
			this.load( options.active );
		}
	},

	_initialActive: function() {
		var active = this.options.active,
			collapsible = this.options.collapsible,
			locationHash = location.hash.substring( 1 );

		if ( active === null ) {

			// check the fragment identifier in the URL
			if ( locationHash ) {
				this.tabs.each( function( i, tab ) {
					if ( $( tab ).attr( "aria-controls" ) === locationHash ) {
						active = i;
						return false;
					}
				} );
			}

			// Check for a tab marked active via a class
			if ( active === null ) {
				active = this.tabs.index( this.tabs.filter( ".ui-tabs-active" ) );
			}

			// No active tab, set to false
			if ( active === null || active === -1 ) {
				active = this.tabs.length ? 0 : false;
			}
		}

		// Handle numbers: negative, out of range
		if ( active !== false ) {
			active = this.tabs.index( this.tabs.eq( active ) );
			if ( active === -1 ) {
				active = collapsible ? false : 0;
			}
		}

		// Don't allow collapsible: false and active: false
		if ( !collapsible && active === false && this.anchors.length ) {
			active = 0;
		}

		return active;
	},

	_getCreateEventData: function() {
		return {
			tab: this.active,
			panel: !this.active.length ? $() : this._getPanelForTab( this.active )
		};
	},

	_tabKeydown: function( event ) {
		var focusedTab = $( $.ui.safeActiveElement( this.document[ 0 ] ) ).closest( "li" ),
			selectedIndex = this.tabs.index( focusedTab ),
			goingForward = true;

		if ( this._handlePageNav( event ) ) {
			return;
		}

		switch ( event.keyCode ) {
		case $.ui.keyCode.RIGHT:
		case $.ui.keyCode.DOWN:
			selectedIndex++;
			break;
		case $.ui.keyCode.UP:
		case $.ui.keyCode.LEFT:
			goingForward = false;
			selectedIndex--;
			break;
		case $.ui.keyCode.END:
			selectedIndex = this.anchors.length - 1;
			break;
		case $.ui.keyCode.HOME:
			selectedIndex = 0;
			break;
		case $.ui.keyCode.SPACE:

			// Activate only, no collapsing
			event.preventDefault();
			clearTimeout( this.activating );
			this._activate( selectedIndex );
			return;
		case $.ui.keyCode.ENTER:

			// Toggle (cancel delayed activation, allow collapsing)
			event.preventDefault();
			clearTimeout( this.activating );

			// Determine if we should collapse or activate
			this._activate( selectedIndex === this.options.active ? false : selectedIndex );
			return;
		default:
			return;
		}

		// Focus the appropriate tab, based on which key was pressed
		event.preventDefault();
		clearTimeout( this.activating );
		selectedIndex = this._focusNextTab( selectedIndex, goingForward );

		// Navigating with control/command key will prevent automatic activation
		if ( !event.ctrlKey && !event.metaKey ) {

			// Update aria-selected immediately so that AT think the tab is already selected.
			// Otherwise AT may confuse the user by stating that they need to activate the tab,
			// but the tab will already be activated by the time the announcement finishes.
			focusedTab.attr( "aria-selected", "false" );
			this.tabs.eq( selectedIndex ).attr( "aria-selected", "true" );

			this.activating = this._delay( function() {
				this.option( "active", selectedIndex );
			}, this.delay );
		}
	},

	_panelKeydown: function( event ) {
		if ( this._handlePageNav( event ) ) {
			return;
		}

		// Ctrl+up moves focus to the current tab
		if ( event.ctrlKey && event.keyCode === $.ui.keyCode.UP ) {
			event.preventDefault();
			this.active.trigger( "focus" );
		}
	},

	// Alt+page up/down moves focus to the previous/next tab (and activates)
	_handlePageNav: function( event ) {
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_UP ) {
			this._activate( this._focusNextTab( this.options.active - 1, false ) );
			return true;
		}
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_DOWN ) {
			this._activate( this._focusNextTab( this.options.active + 1, true ) );
			return true;
		}
	},

	_findNextTab: function( index, goingForward ) {
		var lastTabIndex = this.tabs.length - 1;

		function constrain() {
			if ( index > lastTabIndex ) {
				index = 0;
			}
			if ( index < 0 ) {
				index = lastTabIndex;
			}
			return index;
		}

		while ( $.inArray( constrain(), this.options.disabled ) !== -1 ) {
			index = goingForward ? index + 1 : index - 1;
		}

		return index;
	},

	_focusNextTab: function( index, goingForward ) {
		index = this._findNextTab( index, goingForward );
		this.tabs.eq( index ).trigger( "focus" );
		return index;
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {

			// _activate() will handle invalid values and update this.options
			this._activate( value );
			return;
		}

		this._super( key, value );

		if ( key === "collapsible" ) {
			this._toggleClass( "ui-tabs-collapsible", null, value );

			// Setting collapsible: false while collapsed; open first panel
			if ( !value && this.options.active === false ) {
				this._activate( 0 );
			}
		}

		if ( key === "event" ) {
			this._setupEvents( value );
		}

		if ( key === "heightStyle" ) {
			this._setupHeightStyle( value );
		}
	},

	_sanitizeSelector: function( hash ) {
		return hash ? hash.replace( /[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&" ) : "";
	},

	refresh: function() {
		var options = this.options,
			lis = this.tablist.children( ":has(a[href])" );

		// Get disabled tabs from class attribute from HTML
		// this will get converted to a boolean if needed in _refresh()
		options.disabled = $.map( lis.filter( ".ui-state-disabled" ), function( tab ) {
			return lis.index( tab );
		} );

		this._processTabs();

		// Was collapsed or no tabs
		if ( options.active === false || !this.anchors.length ) {
			options.active = false;
			this.active = $();

		// was active, but active tab is gone
		} else if ( this.active.length && !$.contains( this.tablist[ 0 ], this.active[ 0 ] ) ) {

			// all remaining tabs are disabled
			if ( this.tabs.length === options.disabled.length ) {
				options.active = false;
				this.active = $();

			// activate previous tab
			} else {
				this._activate( this._findNextTab( Math.max( 0, options.active - 1 ), false ) );
			}

		// was active, active tab still exists
		} else {

			// make sure active index is correct
			options.active = this.tabs.index( this.active );
		}

		this._refresh();
	},

	_refresh: function() {
		this._setOptionDisabled( this.options.disabled );
		this._setupEvents( this.options.event );
		this._setupHeightStyle( this.options.heightStyle );

		this.tabs.not( this.active ).attr( {
			"aria-selected": "false",
			"aria-expanded": "false",
			tabIndex: -1
		} );
		this.panels.not( this._getPanelForTab( this.active ) )
			.hide()
			.attr( {
				"aria-hidden": "true"
			} );

		// Make sure one tab is in the tab order
		if ( !this.active.length ) {
			this.tabs.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active
				.attr( {
					"aria-selected": "true",
					"aria-expanded": "true",
					tabIndex: 0
				} );
			this._addClass( this.active, "ui-tabs-active", "ui-state-active" );
			this._getPanelForTab( this.active )
				.show()
				.attr( {
					"aria-hidden": "false"
				} );
		}
	},

	_processTabs: function() {
		var that = this,
			prevTabs = this.tabs,
			prevAnchors = this.anchors,
			prevPanels = this.panels;

		this.tablist = this._getList().attr( "role", "tablist" );
		this._addClass( this.tablist, "ui-tabs-nav",
			"ui-helper-reset ui-helper-clearfix ui-widget-header" );

		// Prevent users from focusing disabled tabs via click
		this.tablist
			.on( "mousedown" + this.eventNamespace, "> li", function( event ) {
				if ( $( this ).is( ".ui-state-disabled" ) ) {
					event.preventDefault();
				}
			} )

			// Support: IE <9
			// Preventing the default action in mousedown doesn't prevent IE
			// from focusing the element, so if the anchor gets focused, blur.
			// We don't have to worry about focusing the previously focused
			// element since clicking on a non-focusable element should focus
			// the body anyway.
			.on( "focus" + this.eventNamespace, ".ui-tabs-anchor", function() {
				if ( $( this ).closest( "li" ).is( ".ui-state-disabled" ) ) {
					this.blur();
				}
			} );

		this.tabs = this.tablist.find( "> li:has(a[href])" )
			.attr( {
				role: "tab",
				tabIndex: -1
			} );
		this._addClass( this.tabs, "ui-tabs-tab", "ui-state-default" );

		this.anchors = this.tabs.map( function() {
			return $( "a", this )[ 0 ];
		} )
			.attr( {
				role: "presentation",
				tabIndex: -1
			} );
		this._addClass( this.anchors, "ui-tabs-anchor" );

		this.panels = $();

		this.anchors.each( function( i, anchor ) {
			var selector, panel, panelId,
				anchorId = $( anchor ).uniqueId().attr( "id" ),
				tab = $( anchor ).closest( "li" ),
				originalAriaControls = tab.attr( "aria-controls" );

			// Inline tab
			if ( that._isLocal( anchor ) ) {
				selector = anchor.hash;
				panelId = selector.substring( 1 );
				panel = that.element.find( that._sanitizeSelector( selector ) );

			// remote tab
			} else {

				// If the tab doesn't already have aria-controls,
				// generate an id by using a throw-away element
				panelId = tab.attr( "aria-controls" ) || $( {} ).uniqueId()[ 0 ].id;
				selector = "#" + panelId;
				panel = that.element.find( selector );
				if ( !panel.length ) {
					panel = that._createPanel( panelId );
					panel.insertAfter( that.panels[ i - 1 ] || that.tablist );
				}
				panel.attr( "aria-live", "polite" );
			}

			if ( panel.length ) {
				that.panels = that.panels.add( panel );
			}
			if ( originalAriaControls ) {
				tab.data( "ui-tabs-aria-controls", originalAriaControls );
			}
			tab.attr( {
				"aria-controls": panelId,
				"aria-labelledby": anchorId
			} );
			panel.attr( "aria-labelledby", anchorId );
		} );

		this.panels.attr( "role", "tabpanel" );
		this._addClass( this.panels, "ui-tabs-panel", "ui-widget-content" );

		// Avoid memory leaks (#10056)
		if ( prevTabs ) {
			this._off( prevTabs.not( this.tabs ) );
			this._off( prevAnchors.not( this.anchors ) );
			this._off( prevPanels.not( this.panels ) );
		}
	},

	// Allow overriding how to find the list for rare usage scenarios (#7715)
	_getList: function() {
		return this.tablist || this.element.find( "ol, ul" ).eq( 0 );
	},

	_createPanel: function( id ) {
		return $( "<div>" )
			.attr( "id", id )
			.data( "ui-tabs-destroy", true );
	},

	_setOptionDisabled: function( disabled ) {
		var currentItem, li, i;

		if ( $.isArray( disabled ) ) {
			if ( !disabled.length ) {
				disabled = false;
			} else if ( disabled.length === this.anchors.length ) {
				disabled = true;
			}
		}

		// Disable tabs
		for ( i = 0; ( li = this.tabs[ i ] ); i++ ) {
			currentItem = $( li );
			if ( disabled === true || $.inArray( i, disabled ) !== -1 ) {
				currentItem.attr( "aria-disabled", "true" );
				this._addClass( currentItem, null, "ui-state-disabled" );
			} else {
				currentItem.removeAttr( "aria-disabled" );
				this._removeClass( currentItem, null, "ui-state-disabled" );
			}
		}

		this.options.disabled = disabled;

		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null,
			disabled === true );
	},

	_setupEvents: function( event ) {
		var events = {};
		if ( event ) {
			$.each( event.split( " " ), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			} );
		}

		this._off( this.anchors.add( this.tabs ).add( this.panels ) );

		// Always prevent the default action, even when disabled
		this._on( true, this.anchors, {
			click: function( event ) {
				event.preventDefault();
			}
		} );
		this._on( this.anchors, events );
		this._on( this.tabs, { keydown: "_tabKeydown" } );
		this._on( this.panels, { keydown: "_panelKeydown" } );

		this._focusable( this.tabs );
		this._hoverable( this.tabs );
	},

	_setupHeightStyle: function( heightStyle ) {
		var maxHeight,
			parent = this.element.parent();

		if ( heightStyle === "fill" ) {
			maxHeight = parent.height();
			maxHeight -= this.element.outerHeight() - this.element.height();

			this.element.siblings( ":visible" ).each( function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			} );

			this.element.children().not( this.panels ).each( function() {
				maxHeight -= $( this ).outerHeight( true );
			} );

			this.panels.each( function() {
				$( this ).height( Math.max( 0, maxHeight -
					$( this ).innerHeight() + $( this ).height() ) );
			} )
				.css( "overflow", "auto" );
		} else if ( heightStyle === "auto" ) {
			maxHeight = 0;
			this.panels.each( function() {
				maxHeight = Math.max( maxHeight, $( this ).height( "" ).height() );
			} ).height( maxHeight );
		}
	},

	_eventHandler: function( event ) {
		var options = this.options,
			active = this.active,
			anchor = $( event.currentTarget ),
			tab = anchor.closest( "li" ),
			clickedIsActive = tab[ 0 ] === active[ 0 ],
			collapsing = clickedIsActive && options.collapsible,
			toShow = collapsing ? $() : this._getPanelForTab( tab ),
			toHide = !active.length ? $() : this._getPanelForTab( active ),
			eventData = {
				oldTab: active,
				oldPanel: toHide,
				newTab: collapsing ? $() : tab,
				newPanel: toShow
			};

		event.preventDefault();

		if ( tab.hasClass( "ui-state-disabled" ) ||

				// tab is already loading
				tab.hasClass( "ui-tabs-loading" ) ||

				// can't switch durning an animation
				this.running ||

				// click on active header, but not collapsible
				( clickedIsActive && !options.collapsible ) ||

				// allow canceling activation
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.tabs.index( tab );

		this.active = clickedIsActive ? $() : tab;
		if ( this.xhr ) {
			this.xhr.abort();
		}

		if ( !toHide.length && !toShow.length ) {
			$.error( "jQuery UI Tabs: Mismatching fragment identifier." );
		}

		if ( toShow.length ) {
			this.load( this.tabs.index( tab ), event );
		}
		this._toggle( event, eventData );
	},

	// Handles show/hide for selecting tabs
	_toggle: function( event, eventData ) {
		var that = this,
			toShow = eventData.newPanel,
			toHide = eventData.oldPanel;

		this.running = true;

		function complete() {
			that.running = false;
			that._trigger( "activate", event, eventData );
		}

		function show() {
			that._addClass( eventData.newTab.closest( "li" ), "ui-tabs-active", "ui-state-active" );

			if ( toShow.length && that.options.show ) {
				that._show( toShow, that.options.show, complete );
			} else {
				toShow.show();
				complete();
			}
		}

		// Start out by hiding, then showing, then completing
		if ( toHide.length && this.options.hide ) {
			this._hide( toHide, this.options.hide, function() {
				that._removeClass( eventData.oldTab.closest( "li" ),
					"ui-tabs-active", "ui-state-active" );
				show();
			} );
		} else {
			this._removeClass( eventData.oldTab.closest( "li" ),
				"ui-tabs-active", "ui-state-active" );
			toHide.hide();
			show();
		}

		toHide.attr( "aria-hidden", "true" );
		eventData.oldTab.attr( {
			"aria-selected": "false",
			"aria-expanded": "false"
		} );

		// If we're switching tabs, remove the old tab from the tab order.
		// If we're opening from collapsed state, remove the previous tab from the tab order.
		// If we're collapsing, then keep the collapsing tab in the tab order.
		if ( toShow.length && toHide.length ) {
			eventData.oldTab.attr( "tabIndex", -1 );
		} else if ( toShow.length ) {
			this.tabs.filter( function() {
				return $( this ).attr( "tabIndex" ) === 0;
			} )
				.attr( "tabIndex", -1 );
		}

		toShow.attr( "aria-hidden", "false" );
		eventData.newTab.attr( {
			"aria-selected": "true",
			"aria-expanded": "true",
			tabIndex: 0
		} );
	},

	_activate: function( index ) {
		var anchor,
			active = this._findActive( index );

		// Trying to activate the already active panel
		if ( active[ 0 ] === this.active[ 0 ] ) {
			return;
		}

		// Trying to collapse, simulate a click on the current active header
		if ( !active.length ) {
			active = this.active;
		}

		anchor = active.find( ".ui-tabs-anchor" )[ 0 ];
		this._eventHandler( {
			target: anchor,
			currentTarget: anchor,
			preventDefault: $.noop
		} );
	},

	_findActive: function( index ) {
		return index === false ? $() : this.tabs.eq( index );
	},

	_getIndex: function( index ) {

		// meta-function to give users option to provide a href string instead of a numerical index.
		if ( typeof index === "string" ) {
			index = this.anchors.index( this.anchors.filter( "[href$='" +
				$.ui.escapeSelector( index ) + "']" ) );
		}

		return index;
	},

	_destroy: function() {
		if ( this.xhr ) {
			this.xhr.abort();
		}

		this.tablist
			.removeAttr( "role" )
			.off( this.eventNamespace );

		this.anchors
			.removeAttr( "role tabIndex" )
			.removeUniqueId();

		this.tabs.add( this.panels ).each( function() {
			if ( $.data( this, "ui-tabs-destroy" ) ) {
				$( this ).remove();
			} else {
				$( this ).removeAttr( "role tabIndex " +
					"aria-live aria-busy aria-selected aria-labelledby aria-hidden aria-expanded" );
			}
		} );

		this.tabs.each( function() {
			var li = $( this ),
				prev = li.data( "ui-tabs-aria-controls" );
			if ( prev ) {
				li
					.attr( "aria-controls", prev )
					.removeData( "ui-tabs-aria-controls" );
			} else {
				li.removeAttr( "aria-controls" );
			}
		} );

		this.panels.show();

		if ( this.options.heightStyle !== "content" ) {
			this.panels.css( "height", "" );
		}
	},

	enable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === false ) {
			return;
		}

		if ( index === undefined ) {
			disabled = false;
		} else {
			index = this._getIndex( index );
			if ( $.isArray( disabled ) ) {
				disabled = $.map( disabled, function( num ) {
					return num !== index ? num : null;
				} );
			} else {
				disabled = $.map( this.tabs, function( li, num ) {
					return num !== index ? num : null;
				} );
			}
		}
		this._setOptionDisabled( disabled );
	},

	disable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === true ) {
			return;
		}

		if ( index === undefined ) {
			disabled = true;
		} else {
			index = this._getIndex( index );
			if ( $.inArray( index, disabled ) !== -1 ) {
				return;
			}
			if ( $.isArray( disabled ) ) {
				disabled = $.merge( [ index ], disabled ).sort();
			} else {
				disabled = [ index ];
			}
		}
		this._setOptionDisabled( disabled );
	},

	load: function( index, event ) {
		index = this._getIndex( index );
		var that = this,
			tab = this.tabs.eq( index ),
			anchor = tab.find( ".ui-tabs-anchor" ),
			panel = this._getPanelForTab( tab ),
			eventData = {
				tab: tab,
				panel: panel
			},
			complete = function( jqXHR, status ) {
				if ( status === "abort" ) {
					that.panels.stop( false, true );
				}

				that._removeClass( tab, "ui-tabs-loading" );
				panel.removeAttr( "aria-busy" );

				if ( jqXHR === that.xhr ) {
					delete that.xhr;
				}
			};

		// Not remote
		if ( this._isLocal( anchor[ 0 ] ) ) {
			return;
		}

		this.xhr = $.ajax( this._ajaxSettings( anchor, event, eventData ) );

		// Support: jQuery <1.8
		// jQuery <1.8 returns false if the request is canceled in beforeSend,
		// but as of 1.8, $.ajax() always returns a jqXHR object.
		if ( this.xhr && this.xhr.statusText !== "canceled" ) {
			this._addClass( tab, "ui-tabs-loading" );
			panel.attr( "aria-busy", "true" );

			this.xhr
				.done( function( response, status, jqXHR ) {

					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout( function() {
						panel.html( response );
						that._trigger( "load", event, eventData );

						complete( jqXHR, status );
					}, 1 );
				} )
				.fail( function( jqXHR, status ) {

					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout( function() {
						complete( jqXHR, status );
					}, 1 );
				} );
		}
	},

	_ajaxSettings: function( anchor, event, eventData ) {
		var that = this;
		return {

			// Support: IE <11 only
			// Strip any hash that exists to prevent errors with the Ajax request
			url: anchor.attr( "href" ).replace( /#.*$/, "" ),
			beforeSend: function( jqXHR, settings ) {
				return that._trigger( "beforeLoad", event,
					$.extend( { jqXHR: jqXHR, ajaxSettings: settings }, eventData ) );
			}
		};
	},

	_getPanelForTab: function( tab ) {
		var id = $( tab ).attr( "aria-controls" );
		return this.element.find( this._sanitizeSelector( "#" + id ) );
	}
} );

// DEPRECATED
// TODO: Switch return back to widget declaration at top of file when this is removed
if ( $.uiBackCompat !== false ) {

	// Backcompat for ui-tab class (now ui-tabs-tab)
	$.widget( "ui.tabs", $.ui.tabs, {
		_processTabs: function() {
			this._superApply( arguments );
			this._addClass( this.tabs, "ui-tab" );
		}
	} );
}

return $.ui.tabs;

} ) );


/***/ }),

/***/ "./node_modules/jquery/dist/jquery.js":
/*!********************************************!*\
  !*** ./node_modules/jquery/dist/jquery.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery JavaScript Library v3.5.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2020-05-04T22:49Z
 */
( function( global, factory ) {

	"use strict";

	if (  true && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var flat = arr.flat ? function( array ) {
	return arr.flat.call( array );
} : function( array ) {
	return arr.concat.apply( [], array );
};


var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};


var document = window.document;



	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.5.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( _i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.5
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://js.foundation/
 *
 * Date: 2020-03-14
 */
( function( window ) {
var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ( {} ).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	pushNative = arr.push,
	push = arr.push,
	slice = arr.slice,

	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[ i ] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
		"ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +

		// "Attribute values must be CSS identifiers [capture 5]
		// or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
		whitespace + "*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +

		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" +
		whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace +
		"*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),

		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace +
			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rhtml = /HTML$/i,
	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g" ),
	funescape = function( escape, nonHex ) {
		var high = "0x" + escape.slice( 1 ) - 0x10000;

		return nonHex ?

			// Strip the backslash prefix from a non-hex escape sequence
			nonHex :

			// Replace a hexadecimal escape sequence with the encoded Unicode code point
			// Support: IE <=11+
			// For values outside the Basic Multilingual Plane (BMP), manually construct a
			// surrogate pair
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" +
				ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		( arr = slice.call( preferredDoc.childNodes ) ),
		preferredDoc.childNodes
	);

	// Support: Android<4.0
	// Detect silently failing push.apply
	// eslint-disable-next-line no-unused-expressions
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			pushNative.apply( target, slice.call( els ) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;

			// Can't trust NodeList.length
			while ( ( target[ j++ ] = els[ i++ ] ) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {
		setDocument( context );
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

				// ID selector
				if ( ( m = match[ 1 ] ) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( ( elem = context.getElementById( m ) ) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[ 2 ] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( ( m = match[ 3 ] ) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!nonnativeSelectorCache[ selector + " " ] &&
				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) &&

				// Support: IE 8 only
				// Exclude object elements
				( nodeType !== 1 || context.nodeName.toLowerCase() !== "object" ) ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// The technique has to be used as well when a leading combinator is used
				// as such selectors are not recognized by querySelectorAll.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 &&
					( rdescend.test( selector ) || rcombinators.test( selector ) ) ) {

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;

					// We can use :scope instead of the ID hack if the browser
					// supports it & if we're not changing the context.
					if ( newContext !== context || !support.scope ) {

						// Capture the context ID, setting it first if necessary
						if ( ( nid = context.getAttribute( "id" ) ) ) {
							nid = nid.replace( rcssescape, fcssescape );
						} else {
							context.setAttribute( "id", ( nid = expando ) );
						}
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
							toSelector( groups[ i ] );
					}
					newSelector = groups.join( "," );
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {

		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {

			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return ( cache[ key + " " ] = value );
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement( "fieldset" );

	try {
		return !!fn( el );
	} catch ( e ) {
		return false;
	} finally {

		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}

		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split( "|" ),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[ i ] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( ( cur = cur.nextSibling ) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return ( name === "input" || name === "button" ) && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
					inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction( function( argument ) {
		argument = +argument;
		return markFunction( function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
					seed[ j ] = !( matches[ j ] = seed[ j ] );
				}
			}
		} );
	} );
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	var namespace = elem.namespaceURI,
		docElem = ( elem.ownerDocument || elem ).documentElement;

	// Support: IE <=8
	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
	// https://bugs.jquery.com/ticket/4833
	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9 - 11+, Edge 12 - 18+
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( preferredDoc != document &&
		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	// Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
	// Safari 4 - 5 only, Opera <=11.6 - 12.x only
	// IE/Edge & older browsers don't support the :scope pseudo-class.
	// Support: Safari 6.0 only
	// Safari 6.0 supports :scope but it's an alias of :root there.
	support.scope = assert( function( el ) {
		docElem.appendChild( el ).appendChild( document.createElement( "div" ) );
		return typeof el.querySelectorAll !== "undefined" &&
			!el.querySelectorAll( ":scope fieldset div" ).length;
	} );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert( function( el ) {
		el.className = "i";
		return !el.getAttribute( "className" );
	} );

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert( function( el ) {
		el.appendChild( document.createComment( "" ) );
		return !el.getElementsByTagName( "*" ).length;
	} );

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert( function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	} );

	// ID filter and find
	if ( support.getById ) {
		Expr.filter[ "ID" ] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute( "id" ) === attrId;
			};
		};
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter[ "ID" ] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode( "id" );
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode( "id" );
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( ( elem = elems[ i++ ] ) ) {
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find[ "TAG" ] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,

				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( ( elem = results[ i++ ] ) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find[ "CLASS" ] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( ( support.qsa = rnative.test( document.querySelectorAll ) ) ) {

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert( function( el ) {

			var input;

			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll( "[msallowcapture^='']" ).length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll( "[selected]" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push( "~=" );
			}

			// Support: IE 11+, Edge 15 - 18+
			// IE 11/Edge don't find elements on a `[name='']` query in some cases.
			// Adding a temporary attribute to the document before the selection works
			// around the issue.
			// Interestingly, IE 10 & older don't seem to have the issue.
			input = document.createElement( "input" );
			input.setAttribute( "name", "" );
			el.appendChild( input );
			if ( !el.querySelectorAll( "[name='']" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
					whitespace + "*(?:''|\"\")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll( ":checked" ).length ) {
				rbuggyQSA.push( ":checked" );
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push( ".#.+[+~]" );
			}

			// Support: Firefox <=3.6 - 5 only
			// Old Firefox doesn't throw on a badly-escaped identifier.
			el.querySelectorAll( "\\\f" );
			rbuggyQSA.push( "[\\r\\n\\f]" );
		} );

		assert( function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement( "input" );
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll( "[name=d]" ).length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll( ":enabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: Opera 10 - 11 only
			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll( "*,:x" );
			rbuggyQSA.push( ",.*:" );
		} );
	}

	if ( ( support.matchesSelector = rnative.test( ( matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector ) ) ) ) {

		assert( function( el ) {

			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		} );
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join( "|" ) );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			) );
		} :
		function( a, b ) {
			if ( b ) {
				while ( ( b = b.parentNode ) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

			// Choose the first element that is related to our preferred document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( a == document || a.ownerDocument == preferredDoc &&
				contains( preferredDoc, a ) ) {
				return -1;
			}

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( b == document || b.ownerDocument == preferredDoc &&
				contains( preferredDoc, b ) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			return a == document ? -1 :
				b == document ? 1 :
				/* eslint-enable eqeqeq */
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( ( cur = cur.parentNode ) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( ( cur = cur.parentNode ) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[ i ] === bp[ i ] ) {
			i++;
		}

		return i ?

			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[ i ], bp[ i ] ) :

			// Otherwise nodes in our document sort first
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			ap[ i ] == preferredDoc ? -1 :
			bp[ i ] == preferredDoc ? 1 :
			/* eslint-enable eqeqeq */
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	setDocument( elem );

	if ( support.matchesSelector && documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||

				// As well, disconnected nodes are said to be in a document
				// fragment in IE 9
				elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch ( e ) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( context.ownerDocument || context ) != document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( elem.ownerDocument || elem ) != document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],

		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			( val = elem.getAttributeNode( name ) ) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return ( sel + "" ).replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {

		// If no nodeType, this is expected to be an array
		while ( ( node = elem[ i++ ] ) ) {

			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {

		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {

			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}

	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[ 3 ] = ( match[ 3 ] || match[ 4 ] ||
				match[ 5 ] || "" ).replace( runescape, funescape );

			if ( match[ 2 ] === "~=" ) {
				match[ 3 ] = " " + match[ 3 ] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {

			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[ 1 ] = match[ 1 ].toLowerCase();

			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

				// nth-* requires argument
				if ( !match[ 3 ] ) {
					Sizzle.error( match[ 0 ] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[ 4 ] = +( match[ 4 ] ?
					match[ 5 ] + ( match[ 6 ] || 1 ) :
					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" ) );
				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

				// other types prohibit arguments
			} else if ( match[ 3 ] ) {
				Sizzle.error( match[ 0 ] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[ 6 ] && match[ 2 ];

			if ( matchExpr[ "CHILD" ].test( match[ 0 ] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[ 3 ] ) {
				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&

				// Get excess from tokenize (recursively)
				( excess = tokenize( unquoted, true ) ) &&

				// advance to the next closing parenthesis
				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

				// excess is a negative index
				match[ 0 ] = match[ 0 ].slice( 0, excess );
				match[ 2 ] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() {
					return true;
				} :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				( pattern = new RegExp( "(^|" + whitespace +
					")" + className + "(" + whitespace + "|$)" ) ) && classCache(
						className, function( elem ) {
							return pattern.test(
								typeof elem.className === "string" && elem.className ||
								typeof elem.getAttribute !== "undefined" &&
									elem.getAttribute( "class" ) ||
								""
							);
				} );
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				/* eslint-disable max-len */

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
				/* eslint-enable max-len */

			};
		},

		"CHILD": function( type, what, _argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, _context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( ( node = node[ dir ] ) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}

								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || ( node[ expando ] = {} );

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								( outerCache[ node.uniqueID ] = {} );

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( ( node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								( diff = nodeIndex = 0 ) || start.pop() ) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {

							// Use previously-cached element index if available
							if ( useCache ) {

								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || ( node[ expando ] = {} );

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									( outerCache[ node.uniqueID ] = {} );

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {

								// Use the same loop as above to seek `elem` from the start
								while ( ( node = ++nodeIndex && node && node[ dir ] ||
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] ||
												( node[ expando ] = {} );

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												( outerCache[ node.uniqueID ] = {} );

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {

			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction( function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[ i ] );
							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
						}
					} ) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {

		// Potentially complex pseudos
		"not": markFunction( function( selector ) {

			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction( function( seed, matches, _context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( ( elem = unmatched[ i ] ) ) {
							seed[ i ] = !( matches[ i ] = elem );
						}
					}
				} ) :
				function( elem, _context, xml ) {
					input[ 0 ] = elem;
					matcher( input, null, xml, results );

					// Don't keep the element (issue #299)
					input[ 0 ] = null;
					return !results.pop();
				};
		} ),

		"has": markFunction( function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		} ),

		"contains": markFunction( function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
			};
		} ),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {

			// lang value must be a valid identifier
			if ( !ridentifier.test( lang || "" ) ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( ( elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
				return false;
			};
		} ),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement &&
				( !document.hasFocus || document.hasFocus() ) &&
				!!( elem.type || elem.href || ~elem.tabIndex );
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {

			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return ( nodeName === "input" && !!elem.checked ) ||
				( nodeName === "option" && !!elem.selected );
		},

		"selected": function( elem ) {

			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {

			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos[ "empty" ]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( ( attr = elem.getAttribute( "type" ) ) == null ||
					attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo( function() {
			return [ 0 ];
		} ),

		"last": createPositionalPseudo( function( _matchIndexes, length ) {
			return [ length - 1 ];
		} ),

		"eq": createPositionalPseudo( function( _matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		} ),

		"even": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"odd": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"lt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ?
				argument + length :
				argument > length ?
					length :
					argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"gt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} )
	}
};

Expr.pseudos[ "nth" ] = Expr.pseudos[ "eq" ];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
			if ( match ) {

				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[ 0 ].length ) || soFar;
			}
			groups.push( ( tokens = [] ) );
		}

		matched = false;

		// Combinators
		if ( ( match = rcombinators.exec( soFar ) ) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,

				// Cast descendant combinators to space
				type: match[ 0 ].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
				( match = preFilters[ type ]( match ) ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :

			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[ i ].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?

		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( ( elem = elem[ dir ] ) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] ||
							( outerCache[ elem.uniqueID ] = {} );

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( ( oldCache = uniqueCache[ key ] ) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return ( newCache[ 2 ] = oldCache[ 2 ] );
						} else {

							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[ i ]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[ 0 ];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[ i ], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( ( elem = unmatched[ i ] ) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction( function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts(
				selector || "*",
				context.nodeType ? [ context ] : context,
				[]
			),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?

				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( ( elem = temp[ i ] ) ) {
					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {

					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) ) {

							// Restore matcherIn since elem is not yet a final match
							temp.push( ( matcherIn[ i ] = elem ) );
						}
					}
					postFinder( null, ( matcherOut = [] ), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( ( elem = matcherOut[ i ] ) &&
						( temp = postFinder ? indexOf( seed, elem ) : preMap[ i ] ) > -1 ) {

						seed[ temp ] = !( results[ temp ] = elem );
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	} );
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
		implicitRelative = leadingRelative || Expr.relative[ " " ],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				( checkContext = context ).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );

			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {

				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[ j ].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(

					// If the preceding token was a descendant combinator, insert an implicit any-element `*`
					tokens
						.slice( 0, i - 1 )
						.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find[ "TAG" ]( "*", outermost ),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
				len = elems.length;

			if ( outermost ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				outermostContext = context == document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( !context && elem.ownerDocument != document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( ( matcher = elementMatchers[ j++ ] ) ) {
						if ( matcher( elem, context || document, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {

					// They will have gone through all possible matchers
					if ( ( elem = !matcher && elem ) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( ( matcher = setMatchers[ j++ ] ) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {

					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
								setMatched[ i ] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {

		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[ i ] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache(
			selector,
			matcherFromGroupMatchers( elementMatchers, setMatchers )
		);

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
			context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

			context = ( Expr.find[ "ID" ]( token.matches[ 0 ]
				.replace( runescape, funescape ), context ) || [] )[ 0 ];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr[ "needsContext" ].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[ i ];

			// Abort if we hit a combinator
			if ( Expr.relative[ ( type = token.type ) ] ) {
				break;
			}
			if ( ( find = Expr.find[ type ] ) ) {

				// Search, expanding context for leading sibling combinators
				if ( ( seed = find(
					token.matches[ 0 ].replace( runescape, funescape ),
					rsibling.test( tokens[ 0 ].type ) && testContext( context.parentNode ) ||
						context
				) ) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert( function( el ) {

	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
} );

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert( function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute( "href" ) === "#";
} ) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	} );
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert( function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
} ) ) {
	addHandle( "value", function( elem, _name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	} );
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert( function( el ) {
	return el.getAttribute( "disabled" ) == null;
} ) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
				( val = elem.getAttributeNode( name ) ) && val.specified ?
					val.value :
					null;
		}
	} );
}

return Sizzle;

} )( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, _i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, _i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, _i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( elem.contentDocument != null &&

			// Support: IE 11+
			// <object> elements with no `data` attribute has an object
			// `contentDocument` with a `null` prototype.
			getProto( elem.contentDocument ) ) {

			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( _i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// Support: IE <=9 only
	// IE <=9 replaces <option> tags with their contents when inserted outside of
	// the select element.
	div.innerHTML = "<option></option>";
	support.option = !!div.lastChild;
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: IE <=9 only
if ( !support.option ) {
	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
}


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 - 11+
// focus() and blur() are asynchronous, except when they are no-op.
// So expect focus to be synchronous when the element is already active,
// and blur to be synchronous when the element is not already active.
// (focus and blur are always synchronous in other supported browsers,
// this just defines when we can count on it).
function expectSync( elem, type ) {
	return ( elem === safeActiveElement() ) === ( type === "focus" );
}

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Only attach events to objects that accept data
		if ( !acceptData( elem ) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = Object.create( null );
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

			handlers = (
					dataPriv.get( this, "events" ) || Object.create( null )
				)[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", returnTrue );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, expectSync ) {

	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
	if ( !expectSync ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var notAsync, result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				// Saved data should be false in such cases, but might be a leftover capture object
				// from an async native handler (gh-4350)
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					// Support: IE <=9 - 11+
					// focus() and blur() are asynchronous
					notAsync = expectSync( this, type );
					this[ type ]();
					result = dataPriv.get( this, type );
					if ( saved !== result || notAsync ) {
						dataPriv.set( this, type, false );
					} else {
						result = {};
					}
					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();
						return result.value;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering the
				// native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved.length ) {

				// ...and capture the result
				dataPriv.set( this, type, {
					value: jQuery.event.trigger(

						// Support: IE <=9 - 11+
						// Extend with the prototype to reset the above stopImmediatePropagation()
						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
						saved.slice( 1 ),
						this
					)
				} );

				// Abort handling of the native event
				event.stopImmediatePropagation();
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, expectSync );

			// Return false to allow normal processing in the caller
			return false;
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		delegateType: delegateType
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.get( src );
		events = pdataOld.events;

		if ( events ) {
			dataPriv.remove( dest, "handle events" );

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = flat( args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								}, doc );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableTrDimensionsVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		},

		// Support: IE 9 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Behavior in IE 9 is more subtle than in newer versions & it passes
		// some versions of this test; make sure not to make it pass there!
		reliableTrDimensions: function() {
			var table, tr, trChild, trStyle;
			if ( reliableTrDimensionsVal == null ) {
				table = document.createElement( "table" );
				tr = document.createElement( "tr" );
				trChild = document.createElement( "div" );

				table.style.cssText = "position:absolute;left:-11111px";
				tr.style.height = "1px";
				trChild.style.height = "9px";

				documentElement
					.appendChild( table )
					.appendChild( tr )
					.appendChild( trChild );

				trStyle = window.getComputedStyle( tr );
				reliableTrDimensionsVal = parseInt( trStyle.height ) > 3;

				documentElement.removeChild( table );
			}
			return reliableTrDimensionsVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Support: IE 9 - 11 only
	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
	// In those cases, the computed value can be trusted to be border-box.
	if ( ( !support.boxSizingReliable() && isBorderBox ||

		// Support: IE 10 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

		// Fall back to offsetWidth/offsetHeight when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		val === "auto" ||

		// Support: Android <=4.1 - 4.3 only
		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"gridArea": true,
		"gridColumn": true,
		"gridColumnEnd": true,
		"gridColumnStart": true,
		"gridRow": true,
		"gridRowEnd": true,
		"gridRowStart": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( _i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
					jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = (
					dataPriv.get( cur, "events" ) || Object.create( null )
				)[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {

				// Handle: regular nodes (via `this.ownerDocument`), window
				// (via `this.document`) & document (via `this`).
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = { guid: Date.now() };

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( _i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
					uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Use a noop converter for missing script
			if ( !isSuccess && jQuery.inArray( "script", s.dataTypes ) > -1 ) {
				s.converters[ "text script" ] = function() {};
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( _i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

jQuery.ajaxPrefilter( function( s ) {
	var i;
	for ( i in s.headers ) {
		if ( i.toLowerCase() === "content-type" ) {
			s.contentType = s.headers[ i ] || "";
		}
	}
} );


jQuery._evalUrl = function( url, options, doc ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options, doc );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			if ( typeof props.top === "number" ) {
				props.top += "px";
			}
			if ( typeof props.left === "number" ) {
				props.left += "px";
			}
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( _i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( _i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );

jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );




// Support: Android <=4.0 only
// Make sure we trim BOM and NBSP
var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};

jQuery.trim = function( text ) {
	return text == null ?
		"" :
		( text + "" ).replace( rtrim, "" );
};



// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( true ) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
		return jQuery;
	}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === "undefined" ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ })

/******/ });
//# sourceMappingURL=jquery-components.js.map