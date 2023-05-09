"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignResolver = void 0;
const src_1 = require("@tsmarsh/subgraph/src");
const src_2 = require("@tsmarsh/callgraph/src");
const assignResolver = (id = "id", queryName, url) => {
    return function (parent, args, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let foreignKey = this[id];
            const query = (0, src_1.processContext)(foreignKey, context, queryName);
            return (0, src_2.callSubgraph)(url, query, queryName);
        });
    };
};
exports.assignResolver = assignResolver;
