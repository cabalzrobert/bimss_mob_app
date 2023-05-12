import { IonSpinner } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';

const FilteringView:React.FC<{visible?:boolean}> = React.memo(({visible})=>{
    if(!visible) return null;
    return (<>
<Panel className="horizontal">
    <div className="vertical">
        <IonSpinner name="crescent" color="primary"/>
    </div>
</Panel>
    </>);

});

export default FilteringView;

//styles
const Panel = styled.div`
position:absolute;
top:0;
height:100%;
width:100%;
z-index: 2;
>div{
    >ion-spinner{
        height: 50px;
        width: 50px;
    }
}
`;
