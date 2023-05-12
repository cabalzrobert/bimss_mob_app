
import { ready } from '../../../tools/plugins/ready';
import { proxy } from '../../../tools/plugins/proxy';
import { stomp as service } from '../../../tools/plugins/stomp';
import { rest } from './rest.service';

export const stomp=(()=>{
    const _ = service('');
    const stomp = proxy(_,{
        ready:ready(),
        refresh:()=>_.setUrl(rest.ws('ws', true)),
    });
    rest.ready(async()=>{
        stomp.refresh();
        stomp.ready();
    });
    return stomp;
})();