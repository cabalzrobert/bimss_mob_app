import React from 'react';

interface ContainerProps {
    height?: string;
    auto?: boolean;
    scroll?: boolean;
    full?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
const Layout : React.FC<ContainerProps> = ({children, height, style={}, className='', full=false, auto=false, scroll=false, }) => {
    const props:any = { style:style, className:className };
    if(!!height) props.style.height = height;
    if(!auto) props.className = ('layout' + (full?' full':'') + ((!props.className?'':' ') + props.className));
    else props.className = ('auto' + (scroll?' scroll':'') + ((!props.className?'':' ') + props.className));
    return(<>
        {!auto?(<div {...props}>{children}</div>):(
            <div {...props}><div style={props.style}><div>
                <div>{children}</div>
            </div></div></div>
        )}
    </>);
};
export default Layout;