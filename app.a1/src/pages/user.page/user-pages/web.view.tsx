import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonDatetime, IonHeader, IonIcon, IonItem, IonTitle } from '@ionic/react';
import React from 'react';
import Layout from '../../../tools/components/+common/layout';
import { mtObj } from '../../../tools/plugins/static';
import TextFit from '../../../tools/components/+common/text-fit';
import ViewPager from '../../../tools/components/+feature/view-pager';
import { styles } from '../../../tools/plugins/element';
import UserPager from '../user-pager';
import Recycler from '../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../intro.page/recycler-storage';
import { arrowBackOutline } from 'ionicons/icons';
import ImgPreloader from '../../../tools/components/+common/img-preloader';

export default class WebView extends React.Component {
    setTitle=(parentTitle:string, pageTitle:string='')=>(this.holder.setTitle(parentTitle, pageTitle),this);
    loadUrl=(url:string)=>(this.holder.loadUrl(url),this);
    //
    shouldComponentUpdate=()=>false;
    holder:ViewHolder = (null as any);
    render(){
        return (<>
<Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref)=>this.holder=ref}/>
        </>);
    }
}

export class ViewHolder extends React.Component {
    state:any = { };
    get pager(){ return UserPager.instance.pager; }
    componentWillMount=()=>this.willMount();
    page:any = {};
    willMount=()=>{
        const page = (this.page = { ParentTitle:'', PageTitle:'' });
        this.setState({page});
    }    

    public setTitle(parentTitle:string, pageTitle:string=''){
        this.page.ParentTitle = parentTitle;
        this.page.PageTitle = pageTitle;
        this.setState({page:this.page})
        return this;
    }
    public loadUrl(url:string){
        console.log(url);
        this.setState({url:url})
        return this;
    }

    hBackButton=()=>{
        if(this.pager==mtObj)return;
        this.pager.back();
    }
    
    render(){
        const{ page={}, url='' } = this.state;
        return (<>
<Layout full>
    <Layout>
        <IonHeader>
            <div style={styles('height:70px;')}>
                <div style={styles('position:relative;top:11px;')}>
                <IonItem lines="none" style={styles('--background:transparent;')}
                    onClick={this.hBackButton}>
                    <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')}/>
                    <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                        Message
                    </IonTitle>
                </IonItem>
                </div>
            </div>
        </IonHeader>
    </Layout>
    <Layout auto>
        <IonContent scrollY> 
            {/* <div style={styles('content:\'\';position:absolute;top:0;opacity:0.45;border-radius:10px;width:100%;height:100%',
                    'background-color:black;border:1px solid rgba(255, 255, 255, 0.5)')}></div>
            <div style={styles('position:relative;height:100%;width:100%;padding:10px')}>
                {!url?null:<>
                <iframe src={url} style={styles('width:100%;height:100%;border:none;')} 
                    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation" />
                </>}
            </div> */}
            <div style={styles('height:auto;display:flex;justify-content:center;margin-top:5%;')}>
                <div className='mail-message'>
                    {/* <div style={styles('position: absolute;top: -8%;left: 13%;z-index: 1;')}>
                        <ImgPreloader style={styles('width:45px')} placeholder='./assets/img/profile_announcement_icon.png'/>
                    </div> */}
                    <IonCard className='card-message'>
                        {/* <IonCardHeader>
                            <IonCardTitle>Announcement</IonCardTitle>
                        </IonCardHeader> */}
                        <IonCardContent>
                            {!url?null:<>
                            <iframe src={url} style={styles('width:100%;height:250px;border:none;')} 
                                sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation" />
                            </>}
                        </IonCardContent>
                    </IonCard>
                </div>
                {/* <div className='mail-top'>
                    <div className='card-top'>

                    </div>
                </div> */}
                {/* <div className='mail-body' style={styles('height:auto;')}>
                    <IonCard className='card-body'>
                    <div className='mail-body-left'></div>
                    <div className='mail-body-right'></div>
                    <div className='mail-body-bottom'></div>
                    </IonCard>
                </div> */}
            </div>
        </IonContent>
    </Layout>
</Layout>
        </>);
    }
}