import queries from '../../queries/user';
import events from '../../events/user';
import { DIV, H1, INPUT, BUTTON } from '../elements';

const addAttribute = (
    DIV({ className: 'add-attribute' },
        INPUT({ placeholder: 'key' }),
        INPUT({ placeholder: 'value' }),
        BUTTON({ onClick: () => 0, className: 'add' }, "+")
    ));

const deleteUserKey =
    (_k: string) => () => {
        // TODO
    };

const render =
    () => {
        const kv = queries.getAttributeKeys().map((k) => {
            const v = queries.getAttributeValue(k);
            return DIV({},
                INPUT({
                    value: k,
                }),
                INPUT({
                    value: v,
                    onChange: (e) => {
                        events.setUserValue(k, e.target.value);
                    },
                }),
                BUTTON({ onClick: deleteUserKey(k), className: 'remove' }, "-"))
        });
        return (
            DIV({ className: 'user' },
                H1({}, queries.getUserName()),
                DIV({ className: 'attributes' }, ...kv),
                addAttribute)
        );
    };

export default render;
