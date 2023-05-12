import { IonButton, IonButtons, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonMenuButton, IonTitle, IonToolbar, } from '@ionic/react';
import React from 'react';
import { NavContext } from '@ionic/react';
import { Alert } from '../../../../tools/components/+common/stack';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import { rest } from '../../../+app/+service/rest.service';
import { arrowBackOutline, eye, eyeOff, saveOutline } from 'ionicons/icons';
import { isPassword } from '../../../../tools/global';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import MenusView from './menu.menus.view';
import Layout from '../../../../tools/components/+common/layout';
import TextFit from '../../../../tools/components/+common/text-fit';
import UserPager from '../../user-pager';
import styled from 'styled-components';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import { jUser, jUserModify } from '../../../+app/user-module';
import { SuperTab, SuperTabs, SuperTabsContainer, SuperTabsToolbar } from '@ionic-super-tabs/react';

//const{ Object }:any = window;
const { Object, data = {} } = (window as any);
const { locations } = data;
const { Group } = data;

export default class ChangePassword extends React.Component {
    setInput = (input: any): ChangePassword => (this.holder.setInput(input), this);
    //
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    static contextType = NavContext;
    state: any = {}
    elIonSelect: any = React.createRef();
    get pager() {console.log('pager'); return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    input: any = {};
    msg: any = {};
    prop: any = {};
    opts: any = {};
    subs: any = {};

    willMount = (didMount = true) => {
        const input = (this.input = {});
        const msg = (this.msg = {});
        const prop = (this.prop = { didMount: didMount});
        const opts = (this.opts = {
            password1: { type: 'password', icon: eyeOff },
            password2: { type: 'password', icon: eyeOff },
            password3: { type: 'password', icon: eyeOff },
        });
        this.setState({ input, msg, prop, opts });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u: any = await jUser();

            if (!u.ACT_ID) return;
            if (u.IsCoordinator || u.IsGeneralCoordinator)
                u.IsPlayer = false;
            u.hasCustomer = (u.IsPlayer || u.IsCoordinator || u.IsGeneralCoordinator);

            this.setState({ u });
        });
    }
    didMount = () => { }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    public setInput(input: any) {
        Object.rcopy(this.input, input);
        return this;
    }

    hConfirm = () => {
        if (!this.isValidEntries()) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }
    private performSubmit() {
        rest.post('member/changepassword', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                this.allowBack = true;
                return Alert.showSuccessMessage(res.Message);
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidEntries(): boolean {
        var isValid = true;

        var password = this.input.Password;
        if (!password) {
            this.msg.Password = 'Please enter Password';
            isValid = false;
        } else if (!isPassword(password)) {
            this.msg.Password = 'Your password must include at least one uppercase and one lowercase letter, a number, and at least 6 or more characters';
            isValid = false;
        } else {
            var cpassword = this.input.ConfirmPassword;
            if (!cpassword) {
                this.msg.ConfirmPassword = 'Please enter Confirm Password';
                isValid = false;
            }
            if (password != cpassword) {
                this.msg.ConfirmPassword = 'Password and Confirm Password not match';
                isValid = false;
            }
        }

        if (isValid) {
            delete this.input.RequestForm;
            this.input.RequestForm = Object.rcopy(this.input);
        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }

    private allowBack: boolean = false;
    onPagerBack() {
        if (this.allowBack)
            return true;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Cancel?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Cancel!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            backdropDismiss: false,
            confirmButtonColor: "#218838",
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res: any) => {
            if (res.isConfirmed) {
                this.allowBack = true;
                return this.pager.backTo(MenusView, true);
            }
        });
        return false;
    }
    hBackButton = () => {
        //this.pager.back();
        //this.swapper.show(UserPager);
        this.pager.back();
    }
    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }
    hHideShowPassword = (password: any) => {
        password.type = (password.type === 'text' ? 'password' : 'text');
        password.icon = (password.icon === eyeOff ? eye : eyeOff);
        this.setState({ opts: this.opts });
    }


    render() {
        const { u = {} } = this.state;
        var grp = Group[0] || {};
        const { input = {}, msg = {}, opts = {}, prop } = this.state;
        input.PGRPID = grp.GroupID;
        input.PLID = grp.PLID;
        input.PSNCD = grp.PSNCD;
        return (<>
            <Layout full>
                <Layout>
                    {/* <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Back</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Change Password" /></div></div>
                    </div> */}
                    <IonHeader>
                    {!prop.didMount ? null :
                        <div style={styles('height:70px;')}>
                            <div style={styles('position:relative;top:11px;')}>
                            <IonItem lines="none" style={styles('--background:transparent;')}
                                onClick={this.hBackButton}>
                                <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')}/>
                                <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                Change Password
                                </IonTitle>
                            </IonItem>
                            </div>
                        </div>
                        }
                    </IonHeader>
                </Layout>
                <Layout auto>
                    <Layout full>
                        {/* <Layout>
                            <div className='col-12 p-0 native'>
                                <UserPanel>
                                    <div className="horizontal user-image">
                                        <ImgPreloader className='brand-image img-circle elevation-1 img-fit'
                                            placeholder="./assets/img/icon_blank_profile.png" src={u.ImageUrl} />
                                    </div>
                                    <div className='horizontal user-name'><b>{u.FLL_NM}&nbsp;</b></div>
                                    <div className='horizontal label-extra'>Mobile No.: {u.MOB_NO}&nbsp;</div>
                                </UserPanel>
                            </div>
                        </Layout> */}
                        <Layout auto>
                            <div className="row m-0 bootstrap-form old" style={styles('height:100%')}>
                                <div className="col-12 p-0 form-container">
                                    <div style={styles('height:100%;width:100%')}>
                                        <SuperTabs>
                                            <SuperTabsContainer style={styles('width: 100%;')}>
                                                <SuperTab noScroll style={styles('width:100%')}>
                                                    {/* <div className='row horizontal'><div className='col-2'></div> */}
                                                        <div className='col-12' style={styles('')}>
                                                            <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}
                                                                style={styles('padding:5px;margin-top:10px;')}>
                                                                <div className={classNames({ 'input-invalid': !!msg.OldPassword })} style={styles('position:relative;')}>
                                                                    <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;--padding-start:25px;height:50px')}
                                                                                type={opts.password1.type} placeholder="Current Password"
                                                                                value={input.OldPassword} {...handle({ onChange: (ev) => this.hState(ev, 'OldPassword') })} />
                                                                        </>} />

                                                                        <IonIcon class="password" item-end icon={opts.password1.icon} onClick={() => this.hHideShowPassword(opts.password1)} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip" style={styles('white-space:normal')}>{msg.OldPassword}</div>
                                                                </div>
                                                                <div className={classNames({ 'input-invalid': !!msg.Password })} style={styles('position:relative')}>
                                                                    <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;--padding-start:25px;height:50px')}
                                                                                type={opts.password2.type} placeholder="New Password"
                                                                                value={input.Password} {...handle({ onChange: (ev) => this.hState(ev, 'Password') })} />
                                                                        </>} />

                                                                        <IonIcon class="password" item-end icon={opts.password2.icon} onClick={() => this.hHideShowPassword(opts.password2)} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip" style={styles('white-space:normal')}>{msg.Password}</div>
                                                                </div>
                                                                <div className={classNames({ 'input-invalid': !!msg.ConfirmPassword })} style={styles('position:relative')}>
                                                                    <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;--padding-start:25px;height:50px')}
                                                                                type={opts.password3.type} placeholder="Confirm Password"
                                                                                value={input.ConfirmPassword} {...handle({ onChange: (ev) => this.hState(ev, 'ConfirmPassword'), hitEnter: this.hConfirm })} />
                                                                        </>} />

                                                                        <IonIcon class="password" item-end icon={opts.password3.icon} onClick={() => this.hHideShowPassword(opts.password3)} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.ConfirmPassword}</div>
                                                                </div>
                                                                {/* <div className="horizontal" style={styles('margin:10px 0px;height:auto')}>
                                                                    <button className="btn-green" style={styles('width:100%;font-size:14pt;')} type="button" onClick={this.hConfirm}>APPLY</button>
                                                                </div> */}
                                                                <div className="btn-sign-in" style={styles('margin-top:15px')}>
                                                                    <IonButton className="signOut" onClick={this.hConfirm}>
                                                                        APPLY
                                                                    </IonButton>
                                                                </div>
                                                            </form>
                                                        </div>
                                                        {/* <div className='col-2'></div></div> */}


                                                </SuperTab>
                                            </SuperTabsContainer>
                                        </SuperTabs>
                                    </div>
                                </div>
                            </div>
                        </Layout>

                    </Layout>
                </Layout>
            </Layout>
        </>);
    }
}
const UserPanel = styled.div`
padding: 0px 10px;
margin-bottom: 25px;
.user-image{
    position: relative;
    height: 150px;  /*//height: 150px;*/
    margin-top: 10px;
    >img{
        background-color: #eceff1;
        width: 150px; /*//width: 150px;*/
    }
}
.user-name{
    font-size: 20pt;
    height: auto;
    text-align: center;
    color:#7a7b7f; /*//color:#default;*/
}
.user-coins{
    img.img-coins{
        height: 40px;
    }
    .label-coins{
        text-align: right;
        font-size: 30px;
        color: white;
        font-weight: bold;
        padding-left: 5px;
        line-height: 35px;
        color:#7a7b7f;
    }
}
.label-extra{
    font-size: 14pt;
    height: auto;
    color:#7a7b7f;
}
`;
const ListItem = styled.div`
height: 50px;
`;