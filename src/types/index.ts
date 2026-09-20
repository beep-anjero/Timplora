export type AccountRole="manager"|"employee";export type Classification="FreeSched"|"Working Student";export type ShiftPeriod="Morning"|"Afternoon"|"Evening";export type RequestStatus="pending"|"approved"|"declined"|"cancelled";export type ScheduleStatus="draft"|"published"|"revised";
export interface Employee{ id:string;name:string;email:string;phone:string;role:AccountRole;classification:Classification;preferredPeriod?:ShiftPeriod;position:string;active:boolean }
export interface Shift{ id:string;employeeId:string;start:string;end:string;label:string;status:ScheduleStatus }
export interface RestDayRequest{ id:string;employeeId:string;date:string;reason:string;status:RequestStatus;submittedAt:string;managerNote?:string }
export interface ClassMeeting{ id:string;employeeId:string;day:number;subject:string;start:string;end:string }
