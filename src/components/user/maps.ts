
import queries from '../../queries/user';
import { DIV, H1, A, UL, LI } from "../elements";
import { Group } from "waend-lib/defs";

const addMap = DIV({ className: 'add-map' }, A({ href: '/edit/new' }, "create map"));

const renderMapItem =
    (group: Group) => (
        LI({ className: 'group-item' },
            A({
                href: `/edit/${group.id}`,
            }, group.getData().name)));


const render =
    () => {
        const groups = queries.getMaps().map(renderMapItem);

        return (
            DIV({ className: 'maps' },
                H1({}, 'Maps'),
                UL({},
                    addMap,
                    ...groups)));
    };

export default render;
