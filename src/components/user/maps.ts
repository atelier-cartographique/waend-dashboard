
import queries from '../../queries/user';
import { DIV, H1, A, UL, LI, SPAN } from "../elements";
import { Group } from "waend-lib/defs";

const addMap = LI({ className: 'add-map' }, A({ href: '/edit/new' }, "create map"));

const renderMapItem =
    (group: Group) => (
        LI({ className: 'group-item' },
            A({
                href: `/edit/${group.id}`,
                className: 'edit-map',
            }, 'edit'),
            A({
                href: `/view/${group.id}`,
                className: 'view-map',
            }, 'view'),
            SPAN({}, group.getData().name)
        ));


const render =
    () => {
        const groups = queries.getMaps().map(renderMapItem);

        return (
            DIV({ className: 'maps' },
                H1({}, 'Maps'),
                UL({},
                    '> Public maps',
                    addMap,
                    ...groups)));
    };

export default render;
