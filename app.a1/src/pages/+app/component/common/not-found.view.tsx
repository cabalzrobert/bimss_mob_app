import React from 'react';
import styled from 'styled-components';
import { styles } from '../../../../tools/plugins/element';

const NotFoundView:React.FC<{visible?:boolean}> = React.memo(({visible})=>{
    if(!visible) return null;
    return (<>
<Panel className="horizontal">
    <div className="vertical">
        <div className="horizontal">
            <img className="img-fit" src="./assets/img/applogo.png" style={styles('opacity:0.15')}/>
        </div>
        <Svg viewBox="0 0 575 50">
            <text y="50">No record found!</text>
        </Svg>
    </div>
</Panel>
    </>);

});

export default NotFoundView;

//styles
const Svg = styled.svg`
font: bold 70px Century Gothic, Arial; 
width : 250px;
height: 120px;
>text{
    fill: none;
    stroke: whitesmoke; /* black; white; */
    stroke-width: .5px;
    stroke-linejoin : round;
    animation: 1.5s pulsate infinite;
}
@keyframes pulsate {50%{ stroke-width:2.5px }}
`;
const Panel = styled.div`
position:absolute;
top:0;
height:100%;
width:100%;
>div{
    >div{
        &.horizontal{
            height:auto
        }
        >img{
            padding:0 2.5%;
            width:250px;
            padding-bottom:100px;
        }
    }
}
`;
