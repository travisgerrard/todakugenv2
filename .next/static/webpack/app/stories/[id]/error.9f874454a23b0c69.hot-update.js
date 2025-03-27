/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/stories/[id]/error",{

/***/ "(app-pages-browser)/./src/components/story-page-error.tsx":
/*!*********************************************!*\
  !*** ./src/components/story-page-error.tsx ***!
  \*********************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   StoryPageError: function() { return /* binding */ StoryPageError; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var _barrel_optimize_names_AlertCircle_lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! __barrel_optimize__?names=AlertCircle!=!lucide-react */ \"(app-pages-browser)/./node_modules/lucide-react/dist/esm/icons/alert-circle.js\");\n/* harmony import */ var _components_ui_alert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/ui/alert */ \"(app-pages-browser)/./src/components/ui/alert.tsx\");\n/* harmony import */ var _components_ui_alert__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_components_ui_alert__WEBPACK_IMPORTED_MODULE_1__);\n/* __next_internal_client_entry_do_not_use__ StoryPageError auto */ \n\n\nfunction StoryPageError(param) {\n    let { error } = param;\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"container mx-auto px-4 py-8\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_alert__WEBPACK_IMPORTED_MODULE_1__.Alert, {\n            variant: \"destructive\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_AlertCircle_lucide_react__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n                    className: \"h-4 w-4\"\n                }, void 0, false, {\n                    fileName: \"/Users/travisgerrard/Documents/Apps/todakuReaderV2/src/components/story-page-error.tsx\",\n                    lineNumber: 14,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_alert__WEBPACK_IMPORTED_MODULE_1__.AlertTitle, {\n                    children: \"Error\"\n                }, void 0, false, {\n                    fileName: \"/Users/travisgerrard/Documents/Apps/todakuReaderV2/src/components/story-page-error.tsx\",\n                    lineNumber: 15,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_alert__WEBPACK_IMPORTED_MODULE_1__.AlertDescription, {\n                    children: error.message || \"An error occurred while loading the story.\"\n                }, void 0, false, {\n                    fileName: \"/Users/travisgerrard/Documents/Apps/todakuReaderV2/src/components/story-page-error.tsx\",\n                    lineNumber: 16,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/travisgerrard/Documents/Apps/todakuReaderV2/src/components/story-page-error.tsx\",\n            lineNumber: 13,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/travisgerrard/Documents/Apps/todakuReaderV2/src/components/story-page-error.tsx\",\n        lineNumber: 12,\n        columnNumber: 5\n    }, this);\n}\n_c = StoryPageError;\nvar _c;\n$RefreshReg$(_c, \"StoryPageError\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL3N0b3J5LXBhZ2UtZXJyb3IudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUUyQztBQUNpQztBQU1yRSxTQUFTSSxlQUFlLEtBQThCO1FBQTlCLEVBQUVDLEtBQUssRUFBdUIsR0FBOUI7SUFDN0IscUJBQ0UsOERBQUNDO1FBQUlDLFdBQVU7a0JBQ2IsNEVBQUNOLHVEQUFLQTtZQUFDTyxTQUFROzs4QkFDYiw4REFBQ1IsdUZBQVdBO29CQUFDTyxXQUFVOzs7Ozs7OEJBQ3ZCLDhEQUFDSiw0REFBVUE7OEJBQUM7Ozs7Ozs4QkFDWiw4REFBQ0Qsa0VBQWdCQTs4QkFDZEcsTUFBTUksT0FBTyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7OztBQUs1QjtLQVpnQkwiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvc3RvcnktcGFnZS1lcnJvci50c3g/ZTE2OCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XG5cbmltcG9ydCB7IEFsZXJ0Q2lyY2xlIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEFsZXJ0LCBBbGVydERlc2NyaXB0aW9uLCBBbGVydFRpdGxlIH0gZnJvbSAnQC9jb21wb25lbnRzL3VpL2FsZXJ0JztcblxuaW50ZXJmYWNlIFN0b3J5UGFnZUVycm9yUHJvcHMge1xuICBlcnJvcjogRXJyb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdG9yeVBhZ2VFcnJvcih7IGVycm9yIH06IFN0b3J5UGFnZUVycm9yUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lciBteC1hdXRvIHB4LTQgcHktOFwiPlxuICAgICAgPEFsZXJ0IHZhcmlhbnQ9XCJkZXN0cnVjdGl2ZVwiPlxuICAgICAgICA8QWxlcnRDaXJjbGUgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XG4gICAgICAgIDxBbGVydFRpdGxlPkVycm9yPC9BbGVydFRpdGxlPlxuICAgICAgICA8QWxlcnREZXNjcmlwdGlvbj5cbiAgICAgICAgICB7ZXJyb3IubWVzc2FnZSB8fCAnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgbG9hZGluZyB0aGUgc3RvcnkuJ31cbiAgICAgICAgPC9BbGVydERlc2NyaXB0aW9uPlxuICAgICAgPC9BbGVydD5cbiAgICA8L2Rpdj5cbiAgKTtcbn0gIl0sIm5hbWVzIjpbIkFsZXJ0Q2lyY2xlIiwiQWxlcnQiLCJBbGVydERlc2NyaXB0aW9uIiwiQWxlcnRUaXRsZSIsIlN0b3J5UGFnZUVycm9yIiwiZXJyb3IiLCJkaXYiLCJjbGFzc05hbWUiLCJ2YXJpYW50IiwibWVzc2FnZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/story-page-error.tsx\n"));

/***/ }),

/***/ "(app-pages-browser)/./src/components/ui/alert.tsx":
/*!*************************************!*\
  !*** ./src/components/ui/alert.tsx ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ })

});