import {AndOrTagConfigJson} from "./TagConfigJson";
import {And, Or, RegexTag, Tag, TagsFilter} from "../../Logic/Tags";

import {Utils} from "../../Utils";

export class FromJSON {

    public static SimpleTag(json: string): Tag {
        const tag = Utils.SplitFirst(json, "=");
        return new Tag(tag[0], tag[1]);
    }

    public static Tag(json: AndOrTagConfigJson | string, context: string = ""): TagsFilter {
        if(json === undefined){
            throw `Error while parsing a tag: 'json' is undefined in ${context}. Make sure all the tags are defined and at least one tag is present in a complex expression`
        }
        if (typeof (json) == "string") {
            const tag = json as string;
            if (tag.indexOf("!~") >= 0) {
                const split = Utils.SplitFirst(tag, "!~");
                if (split[1] === "*") {
                    throw `Don't use 'key!~*' - use 'key=' instead (empty string as value (in the tag ${tag} while parsing ${context})`
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$"),
                    true
                );
            }
            if (tag.indexOf("~~") >= 0) {
                const split = Utils.SplitFirst(tag, "~~");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                        new RegExp("^" + split[0] + "$"),
                    new RegExp("^" + split[1] + "$")
                );
            }
            if (tag.indexOf("!=") >= 0) {
                const split = Utils.SplitFirst(tag, "!=");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$"),
                    true
                );
            }
            if (tag.indexOf("~") >= 0) {
                const split = Utils.SplitFirst(tag, "~");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$")
                );
            }
            const split = Utils.SplitFirst(tag, "=");
            if(split[1] == "*"){
                throw `Error while parsing tag '${tag}' in ${context}: detected a wildcard on a normal value. Use a regex pattern instead`
            }
            return new Tag(split[0], split[1])
        }
        if (json.and !== undefined) {
            return new And(json.and.map(t => FromJSON.Tag(t, context)));
        }
        if (json.or !== undefined) {
            return new Or(json.or.map(t => FromJSON.Tag(t, context)));
        }
    }
}