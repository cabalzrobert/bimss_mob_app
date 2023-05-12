import React from 'react';
import { mtCb } from '../../../../tools/plugins/static';
import SwapPager from '../../../../tools/components/+feature/swap-pager';
import HomeView from './home-pages/home.view';
import { OnPagerFocus, OnPagerLeave } from '../../../../tools/components/+feature/view-pager';
import HomeMenuView from './home-pages/homemenu.view';
import MemberProfileAccount from '../menu-pages/member.account-profile.view';

export default class HomeTabs extends React.Component implements OnPagerFocus, OnPagerLeave {
    getView=()=>this.swapper?.currentComponent?.instance;
    setView=(component:any, callback:Function=mtCb)=>this.swapper?.show(component, callback);
    onPagerFocus=()=>this.swapper.performViewFocus();
    onPagerLeave=()=>this.swapper.performViewLeave();
    //
    shouldComponentUpdate=()=>false;
    swapper:SwapPager = (null as any);
    render(){
        return (<>
<SwapPager ref={(ref:any)=>this.swapper=ref} default={HomeView} /> {/*HomeView/GameView*/}
{/*<SwapPager ref={(ref:any)=>this.swapper=ref} default={HomeView} /> {/*HomeView/GameView*/}
        </>);
    }
}