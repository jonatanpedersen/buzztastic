"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const App_1 = require("./App");
const api_1 = require("../shared/api");
async function main() {
    const api = new api_1.Api();
    const stats = await api.getStats();
    ReactDOM.hydrate(React.createElement(App_1.App, { stats: stats }), document.querySelector('.app'));
}
main();
//# sourceMappingURL=index.js.map