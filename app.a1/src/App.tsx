import './tools/+js.global';
import 'react-jquery-plugin';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
//import '@capacitor-community/http';
import AuthPager  from './pages/auth.page/auth-pager';
import IntroPage  from './pages/intro.page/intro.page';
import UserPager from './pages/user.page/user-pager';
//
import Stack from './tools/components/+common/stack';
import RecyclerStorage  from './pages/intro.page/recycler-storage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './+theme/+global.scss';
import './+theme/variables.scss';
import './+theme/theme.scss';
//
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { multiState } from './tools/plugins/react';
import MemberProfileAccount from './pages/user.page/user-pages/menu-pages/member.account-profile.view';

/*
const App: React.FC = () =>(<>
  <IonApp className="theme">
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/intro" component={IntroPage} />
        <Route path="/in" component={UserPager} />
        <Route path="/out" component={AuthPager} />
        <Redirect exact from="/" to="/intro" />
      </IonRouterOutlet>
    </IonReactRouter>
    <Stack />
    <RecyclerViews/>
  </IonApp>
</>);

export default App;*/
export default class App extends React.Component{
  componentDidMount=()=>this.multiState({show:true});
  //
  multiState = multiState();
  shouldComponentUpdate=()=>false;
  render(){
    const{ multiState } = this;
    return (<>
<IonApp className="theme">
  <IonReactRouter>
    <IonRouterOutlet>
      <Route path="/intro" component={IntroPage} />
      <Route path="/in" component={UserPager} />
      {/* <Route path="/in" component={MemberProfileAccount} /> */}
      <Route path="/out" component={AuthPager} />
      <Redirect exact from="/" to="/intro" />
    </IonRouterOutlet>
  </IonReactRouter>
  <AppDefaults ref={AppDefaults.rgs(multiState)} />
</IonApp>
    </>);
  }
}

class AppDefaults extends React.Component{
  static rgs = ((multiState:any)=>multiState(1,({show}:any)=>({show})));
  state = { show:false };
  render(){
    const{ show } = this.state;
    return(<>
{(!show?null:<>
  <RecyclerStorage />
  <Stack />
</>)}
    </>);
  }
}

/*

962.133 --824:innerHeight
500px:Width
scale:1.5
finalHeight:642px
finalTop:160px

--642/962

--402

802:
500px:424
scale:0.85     //0.849   = (424+0.5)/500
943px          //946px =   802/((424-0.5)/500)
-73px          //-72.5px =


(1+(1-0.849))*802


0.848 -> 0.82

946-802 = 144

  var scaleWidth = 500;

  window.outerWidth
  window.outerHeight


window.addEventListener('resize',function(){
  const adjust = 0.5, scale = 500;
  var adjustWidth = (window.outerWidth + adjust) / scale;
  var adjustHeight = (window.outerWidth - adjust) / scale;
  var scaleWidth = scale;
  var scaleHeight = window.outerHeight / adjustHeight;
  var diffWidth = Math.abs(scaleWidth - window.outerWidth);
  var diffHeight = Math.abs(scaleHeight - window.outerHeight);
  var isHeight = scaleHeight >= scaleWidth; 
  var diffInHeight = (isHeight?-1:1) * (diffHeight/2);
  var diffInWidth = (isHeight?1:-1) * (diffWidth/2);
  
  window.baseScale = adjustWidth;
  window.scaleWidth = scaleWidth;
  window.scaleHeight = scaleHeight;
  window.scaleTop = window.scaleBottom = diffInHeight;
  window.scaleLeft = window.scaleRight = diffInHeight;
});








IntroPage
<Route path="/out" component={AuthPager} />
<Route path="/in" component={UserPager} />
<Redirect exact from="/" to="/out" />
<Redirect exact from="/" to="/in" />

<Route path="/intro" component={IntroPage} />
<Route path="/in" component={UserPager} />
<Route path="/out" component={AuthPager} />
<Redirect exact from="/" to="/intro" />
*/

/*
mapping{
  style={{

  styles\('(.*)[a-z]{1,100}[A-Z]{1,1}[a-z]{0,100}:

}

https://www.npmjs.com/package/react-http-client
https://github.com/capacitor-community/http
https://www.npmjs.com/package/@capacitor-community/http




npx cap sync # required when new plugin added

#my first app
https://ionicframework.com/docs/react/your-first-app
#file transfer
https://dev.to/ionic/how-to-use-ionic-native-plugins-in-react-capacitor-mobile-application-fg7
#style not exist, use only class
https://dev.to/ionic/how-to-css-in-ionic-react-with-styled-components-2eo6


#error in ion-slide_2.entry.js
Object.assign(e.params,this.options); => Object.assign(e.params||{},this.options);


https://stackoverflow.com/questions/40380519/error-package-com-android-annotations-does-not-exist
import android.support.annotation.NonNull; -> import androidx.annotation.NonNull;
//



https://github.com/cordova-sms/cordova-sms-plugin/issues/49
find this:PendingIntent sentIntent = PendingIntent.getBroadcast(this.cordova.getActivity(), 0, new Intent(intentFilterAction), 0);
# SmsManager manager = SmsManager.getDefault();

    <uses-permission android:name="android.permission.SEND_SMS" />



allprojects {
    repositories {
        google()
        jcenter()
    }
    
    //This replaces project.properties w.r.t. build settings
    project.ext {
      defaultBuildToolsVersion="29.0.2" //String
      defaultMinSdkVersion=22 //Integer - Minimum requirement is Android 5.1
      defaultTargetSdkVersion=29 //Integer - We ALWAYS target the latest by default
      defaultCompileSdkVersion=29 //Integer - We ALWAYS compile with the latest by default
    }
}



*/


/*
PendingIntent sentIntent = PendingIntent.getBroadcast((Context)this.cordova.getActivity(), (int)0, (Intent)new Intent("SENDING_SMS"), (int)0); 
//SmsManager sms = SmsManager.getDefault(); 
int SimSlotNo = 0; //0 for sim1, 1 sim2 
SmsManager sms = SmsManager.getSmsManagerForSubscriptionId(SimSlotNo);



    <IonReactRouter >
      <IonTabs >
        <IonRouterOutlet>
          <Route exact path="/tab1">
            <Tab1 />
          </Route>
          <Route exact path="/tab2">
            <Tab2 />
          </Route>
          <Route path="/tab3">
            <Tab3 />
          </Route>
          <Route exact path="/">
            <Redirect to="/tab1" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/tab1">
            <IonIcon icon={triangle} />
            <IonLabel>Tab 1</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2">
            <IonIcon icon={ellipse} />
            <IonLabel>Tab 2</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonIcon icon={square} />
            <IonLabel>Tab 3</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>

*/