import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";


/**
 * Generates all the questions, one by one
 */
export default class QuestionBox extends UIElement {
    private _tags: UIEventSource<any>;

    private _tagRenderings: TagRenderingConfig[];
    private _tagRenderingQuestions: UIElement[];

    private _skippedQuestions: UIEventSource<number[]> = new UIEventSource<number[]>([])
    private _skippedQuestionsButton: UIElement;

    constructor(tags: UIEventSource<any>, tagRenderings: TagRenderingConfig[]) {
        super(tags);
        this.ListenTo(this._skippedQuestions);
        this._tags = tags;
        const self = this;
        this._tagRenderings = tagRenderings.filter(tr => tr.question !== undefined);
        this._tagRenderingQuestions = this._tagRenderings
            .map((tagRendering, i) => new TagRenderingQuestion(this._tags, tagRendering,
                () => {
                    // We save
                    self._skippedQuestions.ping();
                },
                Translations.t.general.skip.Clone()
                    .SetClass("cancel")
                    .onClick(() => {
                        self._skippedQuestions.data.push(i);
                        self._skippedQuestions.ping();
                    })
            ));


        this._skippedQuestionsButton = Translations.t.general.skippedQuestions.Clone()
            .onClick(() => {
                self._skippedQuestions.setData([]);
            })
    }

    InnerRender(): string {
        for (let i = 0; i < this._tagRenderingQuestions.length; i++) {
            let tagRendering = this._tagRenderings[i];
            if(tagRendering.condition &&
                !tagRendering.condition.matchesProperties(this._tags.data)){
                // Filtered away by the condition
                continue;
            }
            
            if (tagRendering.GetRenderValue(this._tags.data) !== undefined) {
                // This value is known
                continue;
            }
            

            if (this._skippedQuestions.data.indexOf(i) >= 0) {
                continue;
            }

            // this value is NOT known
            return this._tagRenderingQuestions[i].Render();
        }

        if (this._skippedQuestions.data.length > 0) {
            return this._skippedQuestionsButton.Render();
        }

        return "";
    }

}