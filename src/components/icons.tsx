/**
 * Eén plek voor alle iconen: Phosphor, in het gewicht "light".
 * De namen blijven de oude, zodat de rest van de code niet hoeft te weten welke set erachter zit.
 * Werkt in server- en clientcomponenten (ssr-build, geen context nodig).
 */
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import {
  Archive as PArchive,
  ArrowLeft as PArrowLeft,
  Bell as PBell,
  TextB as PBold,
  CalendarCheck as PCalendarCheck,
  CalendarDots as PCalendarDays,
  CalendarPlus as PCalendarPlus,
  CalendarX as PCalendarX,
  Check as PCheck,
  CheckCircle as PCheckCircle2,
  CaretDown as PChevronDown,
  CaretLeft as PChevronLeft,
  CaretRight as PChevronRight,
  CreditCard as PCreditCard,
  DownloadSimple as PDownload,
  Eye as PEye,
  FileArrowDown as PFileDown,
  TextHTwo as PHeading2,
  TextHThree as PHeading3,
  TextItalic as PItalic,
  ListChecks as PListChecks,
  LockSimple as PLock,
  SignOut as PLogOut,
  EnvelopeSimple as PMail,
  MapPin as PMapPin,
  List as PMenu,
  ChatText as PMessageSquareText,
  ChatsCircle as PMessagesSquare,
  Minus as PMinus,
  DotsThree as PMoreHorizontal,
  NotePencil as PNotebookPen,
  Pause as PPause,
  PencilSimpleLine as PPenLine,
  Phone as PPhone,
  Play as PPlay,
  Plus as PPlus,
  Quotes as PQuote,
  Receipt as PReceipt,
  ArrowCounterClockwise as PRotateCcw,
  MagnifyingGlass as PSearch,
  GearSix as PSettings,
  ShieldCheck as PShieldCheck,
  DeviceMobile as PSmartphone,
  TextStrikethrough as PStrikethrough,
  Sun as PSun,
  Trash as PTrash2,
  TextT as PType,
  User as PUserRound,
  Users as PUsers,
  VideoCamera as PVideo,
  X as PX,
} from "@phosphor-icons/react/dist/ssr";

export type Icon = ComponentType<IconProps>;

function light(I: Icon, name: string): Icon {
  const C = (props: IconProps) => <I weight="light" {...props} />;
  C.displayName = name;
  return C;
}

export const Archive = light(PArchive, "Archive");
export const ArrowLeft = light(PArrowLeft, "ArrowLeft");
export const Bell = light(PBell, "Bell");
export const Bold = light(PBold, "Bold");
export const CalendarCheck = light(PCalendarCheck, "CalendarCheck");
export const CalendarDays = light(PCalendarDays, "CalendarDays");
export const CalendarPlus = light(PCalendarPlus, "CalendarPlus");
export const CalendarX = light(PCalendarX, "CalendarX");
export const Check = light(PCheck, "Check");
export const CheckCircle2 = light(PCheckCircle2, "CheckCircle2");
export const ChevronDown = light(PChevronDown, "ChevronDown");
export const ChevronLeft = light(PChevronLeft, "ChevronLeft");
export const ChevronRight = light(PChevronRight, "ChevronRight");
export const CreditCard = light(PCreditCard, "CreditCard");
export const Download = light(PDownload, "Download");
export const Eye = light(PEye, "Eye");
export const FileDown = light(PFileDown, "FileDown");
export const Heading2 = light(PHeading2, "Heading2");
export const Heading3 = light(PHeading3, "Heading3");
export const Italic = light(PItalic, "Italic");
export const ListChecks = light(PListChecks, "ListChecks");
export const Lock = light(PLock, "Lock");
export const LogOut = light(PLogOut, "LogOut");
export const Mail = light(PMail, "Mail");
export const MapPin = light(PMapPin, "MapPin");
export const Menu = light(PMenu, "Menu");
export const MessageSquareText = light(PMessageSquareText, "MessageSquareText");
export const MessagesSquare = light(PMessagesSquare, "MessagesSquare");
export const Minus = light(PMinus, "Minus");
export const MoreHorizontal = light(PMoreHorizontal, "MoreHorizontal");
export const NotebookPen = light(PNotebookPen, "NotebookPen");
export const Pause = light(PPause, "Pause");
export const PenLine = light(PPenLine, "PenLine");
export const Phone = light(PPhone, "Phone");
export const Play = light(PPlay, "Play");
export const Plus = light(PPlus, "Plus");
export const Quote = light(PQuote, "Quote");
export const Receipt = light(PReceipt, "Receipt");
export const RotateCcw = light(PRotateCcw, "RotateCcw");
export const Search = light(PSearch, "Search");
export const Settings = light(PSettings, "Settings");
export const ShieldCheck = light(PShieldCheck, "ShieldCheck");
export const Smartphone = light(PSmartphone, "Smartphone");
export const Strikethrough = light(PStrikethrough, "Strikethrough");
export const Sun = light(PSun, "Sun");
export const Trash2 = light(PTrash2, "Trash2");
export const Type = light(PType, "Type");
export const UserRound = light(PUserRound, "UserRound");
export const Users = light(PUsers, "Users");
export const Video = light(PVideo, "Video");
export const X = light(PX, "X");
