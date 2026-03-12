// WebSocket message protocol between tutor-mcp server and browser client

// ── Server → Browser ──

export interface QuestionMsg {
  type: 'question';
  reqId: string;
  text: string;
}

export interface AnswerMsg {
  type: 'answer';
  reqId: string;
  html: string;
}

export interface ChartMsg {
  type: 'chart';
  reqId: string;
  width: number;
  height: number;
  drawCode: string;
}

export interface AppendMsg {
  type: 'append';
  reqId: string;
  blockId: string;
  html: string;
}

export interface ClearMsg {
  type: 'clear';
  reqId: string;
}

export interface InteractiveMsg {
  type: 'interactive';
  reqId: string;
  src: string;
  title: string;
  width: number;
  height: number;
}

export interface HistoryRequestMsg {
  type: 'history_request';
  reqId: string;
}

export type ServerMsg = QuestionMsg | AnswerMsg | ChartMsg | AppendMsg | ClearMsg | InteractiveMsg | HistoryRequestMsg;

// ── Browser → Server ──

export interface AckMsg {
  type: 'ack';
  reqId: string;
  blockId: string;
}

export interface ErrorMsg {
  type: 'error';
  reqId: string;
  message: string;
}

export interface UserQuestionMsg {
  type: 'user_question';
  text: string;
}

export interface HelloMsg {
  type: 'hello';
}

export type ClientMsg = AckMsg | ErrorMsg | UserQuestionMsg | HelloMsg;

// ── Peer-to-peer (process ↔ process) ──

export interface TakeoverMsg {
  type: 'takeover';
}
export type PeerMsg = TakeoverMsg;
