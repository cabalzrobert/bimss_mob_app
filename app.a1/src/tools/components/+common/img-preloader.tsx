import React from 'react';
import { mtCb } from '../../plugins/static';

const{ Object, location }:any = window;

interface ContainerProps {
    src?: string | undefined;
    placeholder?: string | undefined;
    style?: React.CSSProperties;
    className?: string | undefined;
    error?:Function | undefined;
}

export default class ImgPreloader extends React.Component<ContainerProps> {
    private static caches:any = {};
    state:any = { src: '' }
    componentWillMount=()=>{
        this.checkProps(this.props);
        const{ prop } = this;
        this.setState({prop});
    }

    prop:any = {};
    componentDidMount=()=>{
        setTimeout(()=>this.performDownload());
    }
    componentWillReceiveProps=(props:any)=>{
        this.checkProps(props);
        this.setState({prop:this.prop});
        setTimeout(()=>this.performDownload());
    }

    private checkProps(props:any){ 
        Object.rcopy(this.prop, props);
        const src =  (props.src||'');
        this.state.src = (props.placeholder||'');
        if(!src)return;
        this.prop.IsLocalUrl = (src.startsWith('./')||src.startsWith(location.origin));
        this.prop.IsUrl = (this.prop.IsLocalUrl||src.startsWith('http'));
        if(!this.prop.IsUrl) return;
        if(!this.prop.IsLocalUrl){
            const cache = ImgPreloader.caches[src];
            if(!cache) return;
        }
        this.state.src = src;
    }

    downloadingImage:any;
    private performDownload(){
        if(this.prop.IsLocalUrl)return;
        const src = (this.prop.src||'');
        if(!src) return this.setState({src:this.state.src, prop:this.prop});
        this.downloadingImage = new Image();
        this.downloadingImage.onload = () => {
            this.setState({src});
            if(!this.prop.IsUrl) return;
            if(!!ImgPreloader.caches[src])return;
            ImgPreloader.caches[src] = true;
        }
        this.downloadingImage.onerror = () => {
            (this.prop.error||mtCb)();
        };
        this.downloadingImage.src = src;
    }

    render(){
        const{ src, prop={} } = this.state; 
        return (<>
<img src={src} className={prop.className} style={prop.style}/>
        </>);
    }
}
