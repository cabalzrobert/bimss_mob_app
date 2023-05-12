import { IonContent } from '@ionic/react';
import React from 'react';
import Layout from '../../../tools/components/+common/layout';
import { mtObj } from '../../../tools/plugins/static';
import TextFit from '../../../tools/components/+common/text-fit';
import ViewPager from '../../../tools/components/+feature/view-pager';
import { styles } from '../../../tools/plugins/element';
import UserPager from '../user-pager';
import Recycler from '../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../intro.page/recycler-storage';

export default class WebEventView extends React.Component {
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
        const page = (this.page = { ParentTitle:'', PageTitle:'',  });
        this.setState({page});
    }    

    public setTitle(parentTitle:string, pageTitle:string=''){
        this.page.ParentTitle = parentTitle;
        this.page.PageTitle = pageTitle;
        this.setState({page:this.page})
        return this;
    }
    public loadUrl(url:string){
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
        <div className="row m-0 toolbar-panel">
            <div className="vertical arrow-back" onClick={this.hBackButton}></div>
            <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>{page.ParentTitle}</div>
            <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text={page.PageTitle}/></div></div>
        </div>
    </Layout>
    <Layout auto>
        <IonContent scrollY> 
            <div style={styles('content:\'\';position:absolute;top:0;opacity:0.45;border-radius:10px;width:100%;height:100%',
                    'background-color:black;border:1px solid rgba(255, 255, 255, 0.5)')}></div> {/* background-color: white;*/}
            <div style={styles('position:relative;height:100%;width:100%;padding:10px')}>
                {!url?null:<>
                <iframe src={url} style={styles('width:100%;height:100%;border:none;')} 
                    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation" />
                </>}
            </div>
        </IonContent>
    </Layout>
</Layout>
        </>);
    }
}