import React from 'react';
import Recycler, { ListView } from '../../tools/components/+feature/recycler';

import { ViewHolder as SignInView } from '../auth.page/auth-pages/sign-in.view';
import { ViewHolder as SignUpWithMobileView } from '../auth.page/auth-pages/sign-up-with-mobile.view';
import { ViewHolder as SignUpView } from '../auth.page/auth-pages/sign-up.view';
import { ViewHolder as VerifyOtpView } from '../auth.page/auth-pages/verify-otp.view';
import { ViewHolder as ForgotPasswordView } from '../auth.page/auth-pages/forgot-password-pages/forgot-password.view';
import { ViewHolder as NewPasswordView } from '../auth.page/auth-pages/forgot-password-pages/new-password.view';
//
import { ViewHolder as WebEventView } from '../user.page/user-pages/web.view';
import { ViewHolder as WebView } from '../user.page/user-pages/web.view';
import { ViewHolder as GameViewHolder } from '../user.page/user-pages/home.page/home-pages/game.view';
import { ViewHolder as GameProfileView } from '../user.page/user-pages/menu-pages/profile.game-profile.view';
import { ViewHolder as MenusView } from '../user.page/user-pages/menu-pages/menu.menus.view';
import { ViewHolder as ChangePasswordView } from '../user.page/user-pages/menu-pages/profile.change-password.view';
import { ViewHolder as ChangeAvatarView } from '../user.page/user-pages/menu-pages/profile.change-avatar.view';
import { ViewHolder as PowerApSummaryView } from '../user.page/user-pages/menu-pages/downline.power-ap-summary.view';
import { ViewHolder as PowerApView } from '../user.page/user-pages/menu-pages/downline.power-ap.view';
import { ViewHolder as HelpCenterView } from '../user.page/user-pages/menu-pages/help.help-center.view';
import { ViewHolder as ReportProblemView } from '../user.page/user-pages/menu-pages/help.report-problem.view';
import { ViewHolder as CreditLedgerView } from '../user.page/user-pages/menu-pages/ledger.credit-ledger.view';
import { ViewHolder as AnnouncementView } from '../user.page/user-pages/menu-pages/other.announcement.view';
import { ViewHolder as NotificationsView } from '../user.page/user-pages/home.page/notifications.view';
import { ViewHolder as SalesReportView } from '../user.page/user-pages/menu-pages/record.sales-report.view';
import { ViewHolder as SettingsView } from '../user.page/user-pages/menu-pages/setting.settings.view';
import { ViewHolder as ClaimWinningView } from '../user.page/user-pages/menu-pages/winning.claim-winning.view';
import { ViewHolder as UnClaimWinningView } from '../user.page/user-pages/menu-pages/winning.unclaim-winning.view';
import { ViewHolder as ActivityLogsView } from '../user.page/user-pages/menu-pages/log.activity-logs.view';
import { ViewHolder as StreamingHomeView } from '../user.page/user-pages/home.page/home-pages/home.streaming.view';
import { ViewHolder as HomeView } from '../user.page/user-pages/home.page/home-pages/home.view';
import { ViewHolder as EventsView } from '../user.page/user-pages/menu-pages/events.view';
import { ViewHolder as DonationHistoryView } from '../user.page/user-pages/menu-pages/record.donation-history.view';
import { ViewHolder as UnclaimClaimDonation } from '../user.page/user-pages/menu-pages/record.donation-claim-unclaim.view';
import { ViewHolder as MemberHistory } from '../user.page/user-pages/menu-pages/record.member-list.view';
import { ViewHolder as IssuesConcerHistory } from '../user.page/user-pages/menu-pages/record.issuesconcern-list.view';
import { ViewHolder as LeaderDirectAddMember } from '../user.page/user-pages/menu-pages/leader.direct-member.view';
import { ViewHolder as LeaderDirectUpdateMember } from '../user.page/user-pages/menu-pages/leader.direct-updatemember.view';
import { ViewHolder as MemberAccountPromotion } from '../user.page/user-pages/menu-pages/memberpromotion.account.view';
import { ViewHolder as NewEvent } from '../user.page/user-pages/menu-pages/event.new.view';



import { ViewHolder as MemberProfileAccount } from '../user.page/user-pages/menu-pages/member.account-profile.view';
import { ViewHolder as ChangePassword } from '../user.page/user-pages/menu-pages/changepassword.account.view';
import { ViewHolder as IssuesConcernUpdate} from '../user.page/user-pages/menu-pages/issuesconcern.new.view';
import { ViewHolder as IssuesConcernAppHistory} from '../user.page/user-pages/menu-pages/record.issuesconcern-open-pending-close.view';
import { ViewHolder as AddReportProblemView} from '../user.page/user-pages/menu-pages/help.report.add-problem.view';
import { ViewHolder as IssusConcernAttachmentView} from '../user.page/user-pages/menu-pages/issuesconcern-attachment.view';
import { ViewHolder as MemorandumHistory} from '../user.page/user-pages/menu-pages/record.memo-list.view';
import { ViewHolder as MemoAttachmentView} from '../user.page/user-pages/menu-pages/memo.view';
import { ViewHolder as RequestDocuemntAppHistory} from '../user.page/user-pages/menu-pages/record.requestdoc-open-unclaim-claim.view';
import {ViewHolder as RequestDocumentAttachmentView} from '../user.page/user-pages/menu-pages/requestdocument-attachment.view';
import {ViewHolder as RequestBrgyClearanceView} from '../user.page/user-pages/menu-pages/brgyclearance.new.view';
import {ViewHolder as RequestBrgyBusinessPermitView} from '../user.page/user-pages/menu-pages/brgybusinesspermit.new.view';
import {ViewHolder as RequestBrgyCTCView} from '../user.page/user-pages/menu-pages/brgyctc.new.view';
import {ViewHolder as RequestBrgyDocumentView} from '../user.page/user-pages/menu-pages/brgyrequestdoc.new.view';
import {ViewHolder as RequestBarangayClearacneAppHistory} from '../user.page/user-pages/menu-pages/record.requestbrgyclearance-open-unclaim-claim.view';
import {ViewHolder as ChatSupportView} from '../user.page/user-pages/menu-pages/brgyChatSupport.view';
import {ViewHolder as RequestBarangayBusinessClearacneAppHistory} from '../user.page/user-pages/menu-pages/record.requestbrgybusinessclearance-open-unclaim-claim.view';
import {ViewHolder as RequestBrgyBusinessClearanceView} from '../user.page/user-pages/menu-pages/brgybusinessclearance.new.view';
import {ViewHolder as RequestBarangayOtherDocumentAppHistory} from '../user.page/user-pages/menu-pages/record.requestbrgyotherdoc-open-unclaim-claim.view';
import {ViewHolder as RequestBrgyOtherDocumentView} from '../user.page/user-pages/menu-pages/brgyotherdocument.new.view';
import {ViewHolder as HomeMenuView} from '../user.page/user-pages/home.page/home-pages/homemenu.view';
import {ViewHolder as BlotterComplaintSummonAppHistory} from '../user.page/user-pages/menu-pages/record.blotter-complaint-summon-close-cancel.view';
import {ViewHolder as BlotterComplaintSummonAttachmentView} from '../user.page/user-pages/menu-pages/blotter-complaint-summon.new.view.tsx';
import {ViewHolder as RequestBarangayCedulaAppHistory} from '../user.page/user-pages/menu-pages/record.requestcedula-open-unclaim-claim.view';
import {ViewHolder as BlotterAppHistory} from '../user.page/user-pages/menu-pages/record.blotter-list.view';
import {ViewHolder as ComplaintAttachmentView} from '../user.page/user-pages/menu-pages/complaint-attachment.view';
import {ViewHolder as BrgyOfficialAppHistory} from '../user.page/user-pages/menu-pages/record.brgyofficial-list.view';
import {ViewHolder as EducationBackgroundAppHistory} from '../user.page/user-pages/menu-pages/account.educbackground-list.view';
import {ViewHolder as AccountEducBackgroundView} from '../user.page/user-pages/menu-pages/accounteducbackground.new.view';
import {ViewHolder as EmployementAppHistory} from '../user.page/user-pages/menu-pages/account.employementhistory-list.view';
import {ViewHolder as AccountEmploymentHistoryView} from '../user.page/user-pages/menu-pages/account.employementhistory.new.view';
import {ViewHolder as OrganizationView} from '../user.page/user-pages/menu-pages/account.organization-new.view';
import {ViewHolder as OrganizationAppHistory} from '../user.page/user-pages/menu-pages/account.organization-list.view';
import {ViewHolder as ValidGovernmentIDView} from '../user.page/user-pages/menu-pages/account.validgovernmentid.new.view';
import {ViewHolder as ValidGorvernmentIDAppHistory} from '../user.page/user-pages/menu-pages/account.validgovernmentid.list.view';
import {ViewHolder as OrherDocumentAppHistory} from '../user.page/user-pages/menu-pages/record.other-document-list.view';
import {ViewHolder as BrgyOtherDocumentView} from '../user.page/user-pages/menu-pages/brgy-other-documents.new.view.tsx';
import {ViewHolder as EstablishmentView} from '../user.page/user-pages/menu-pages/establishment.view';
import {ViewHolder as MenuSettingsView} from '../user.page/user-pages/menu-pages/menu.settings.view';
import {ViewHolder as EmergencyAlertHistory} from '../user.page/user-pages/menu-pages/record.emergency-alert-list.view';


export default class RecyclerStorage extends React.Component {
    static instance: ListView = ({} as any);
    shouldComponentUpdate = () => false;
    render() {
        return (<>
            <Recycler.List ref={(ref: any) => RecyclerStorage.instance = ref} pages={[
                SignInView, SignUpWithMobileView, SignUpView, VerifyOtpView,
                NewPasswordView, ForgotPasswordView,
                //
                StreamingHomeView, HomeView, HomeMenuView,
                WebView, WebEventView,
                GameViewHolder,
                NotificationsView,PowerApView,EventsView,
                //
                PowerApSummaryView,
                HelpCenterView, ReportProblemView,
                CreditLedgerView, SalesReportView,
                AnnouncementView, NewEvent,
                MenusView, DonationHistoryView, 
                ChangePassword,
                MemberHistory, AddReportProblemView, EducationBackgroundAppHistory, AccountEducBackgroundView,
                ValidGovernmentIDView, ValidGorvernmentIDAppHistory, 
                EmployementAppHistory, AccountEmploymentHistoryView,
                OrganizationView, OrganizationAppHistory,
                IssuesConcerHistory ,IssuesConcernUpdate, 
                IssuesConcernAppHistory, IssusConcernAttachmentView,
                RequestDocuemntAppHistory, RequestDocumentAttachmentView, ChatSupportView,
                RequestBrgyClearanceView, RequestBrgyBusinessPermitView, RequestBrgyCTCView, 
                RequestBrgyDocumentView, RequestBrgyOtherDocumentView,
                BlotterComplaintSummonAppHistory, BlotterAppHistory, ComplaintAttachmentView,
                BlotterComplaintSummonAttachmentView, BrgyOfficialAppHistory,
                RequestBarangayBusinessClearacneAppHistory, RequestBarangayCedulaAppHistory, 
                OrherDocumentAppHistory, BrgyOtherDocumentView, EstablishmentView, EmergencyAlertHistory,
                RequestBarangayClearacneAppHistory, RequestBrgyBusinessClearanceView, RequestBarangayOtherDocumentAppHistory,
                MemorandumHistory, MemoAttachmentView,
                LeaderDirectAddMember, MemberAccountPromotion,
                LeaderDirectUpdateMember, UnclaimClaimDonation,
                GameProfileView, ChangePasswordView, ChangeAvatarView,
                SettingsView,
                ClaimWinningView, UnClaimWinningView,
                ActivityLogsView,MenuSettingsView,

                MemberProfileAccount,
            ]} />
        </>);
    }
}