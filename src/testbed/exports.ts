
type usize = number
type u32 = number
type i32 = number

export class Exports {

  interface_version_8?: () => void
  allocate?: (size: usize) => number
  deallocate?: (pointer: u32) => void
  instantiate?: (env_ptr: u32, info_ptr: u32, msg_ptr: u32) => number
  execute?: (env_ptr: u32, info_ptr: u32, msg_ptr: u32) => number
  query?: (env_ptr: u32, msg_ptr: u32) => number
  migrate?: (env_ptr: u32, info_ptr: u32, msg_ptr: u32) => number
  reply?: (env_ptr: u32, msg_ptr: u32) => number
  sudo?: (env_ptr: u32, msg_ptr: u32) => number
  ibc_channel_open?: (env_ptr: u32, msg_ptr: u32) => number
  ibc_channel_connect?: (env_ptr: u32, msg_ptr: u32) => number
  ibc_channel_close?: (env_ptr: u32, msg_ptr: u32) => number
  ibc_packet_receive?: (env_ptr: u32, msg_ptr: u32) => number
  ibc_packet_ack?: (env_ptr: u32, msg_ptr: u32) => number
  ibc_packet_timeout?: (env_ptr: u32, msg_ptr: u32) => number

  constructor(exports: WebAssembly.Exports) {
    this.interface_version_8 = exports["interface_version_8"] as any
    this.allocate = exports["allocate"] as any
    this.deallocate = exports["deallocate"] as any
    this.instantiate = exports["instantiate"] as any
    this.execute = exports["execute"] as any
    this.query = exports["query"] as any
    this.migrate = exports["migrate"] as any
    this.reply = exports["reply"] as any
    this.sudo = exports["sudo"] as any
    this.ibc_channel_open = exports["ibc_channel_open"] as any
    this.ibc_channel_connect = exports["ibc_channel_connect"] as any
    this.ibc_channel_close = exports["ibc_channel_close"] as any
    this.ibc_packet_receive = exports["ibc_packet_receive"] as any
    this.ibc_packet_ack = exports["ibc_packet_ack"] as any
    this.ibc_packet_timeout = exports["ibc_packet_timeout"] as any
  }

}
