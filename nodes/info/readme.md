# Node: huawei-info
The info node has possibility to return lots of info found in the API.

Hare are some examples of data returned:

  * [Monitor status](#monitor-status)
  * [convergedStatus](#convergedstatus)
  * [checkNotifications](#checknotifications)
  * [trafficStatistics](#trafficstatistics)
  * [monthStatistics](#monthstatistics)
  * [LAN hostInfo](#lan-hostinfo)
  * [Wireless hostList](#wireless-hostlist)
  * [signal](#signal)

## Monitor status
```js
{
  ConnectionStatus: '901',
  WifiConnectionStatus: '',
  SignalStrength: '',
  SignalIcon: '5',
  CurrentNetworkType: '19',
  CurrentServiceDomain: '3',
  RoamingStatus: '0',
  BatteryStatus: '',
  BatteryLevel: '',
  BatteryPercent: '',
  simlockStatus: '0',
  PrimaryDns: '',
  SecondaryDns: '',
  PrimaryIPv6Dns: '',
  SecondaryIPv6Dns: '',
  CurrentWifiUser: '4',
  TotalWifiUser: '64',
  currenttotalwifiuser: '32',
  ServiceStatus: '2',
  SimStatus: '1',
  WifiStatus: '1',
  CurrentNetworkTypeEx: '101',
  maxsignal: '5',
  wifiindooronly: '0',
  wififrequence: '0',
  classify: 'cpe',
  flymode: '0',
  cellroam: '1',
  usbup: '0'
}
```

## convergedStatus
```js
{ SimState: '257', SimLockEnable: '0', CurrentLanguage: '' }
```

## checkNotifications
```js
{ UnreadMessage: '0', SmsStorageFull: '0', OnlineUpdateStatus: '14' }
```

## trafficStatistics
```js
{
  CurrentConnectTime: '133226',
  CurrentUpload: '400990461',
  CurrentDownload: '9000489064',
  CurrentDownloadRate: '3542',
  CurrentUploadRate: '92',
  TotalUpload: '234383915685',
  TotalDownload: '4994438892948',
  TotalConnectTime: '80894943',
  showtraffic: '1'
}
```
## monthStatistics
```js
{
  CurrentMonthDownload: '197917792949',
  CurrentMonthUpload: '9650510195',
  MonthDuration: '1886268',
  MonthLastClearTime: '2022-3-1'
}
```
## LAN hostInfo
```js
[
  {
    MacAddress: 'AA:BB:CC:DD:EE:22',
    Active: '1',
    AssociatedSsid: '',
    HostName: 'PC LAN',
    AddressSource: 'DHCP',
    isLocalDevice: '0',
    LeaseTime: '82358',
    ID: '1',
    InterfaceType: 'Ethernet',
    AssociatedTime: '4041',
    IpAddress: '192.168.8.4'
  },
  {
    MacAddress: 'AA:BB:CC:DD:EE:22',
    Active: '0',
    AssociatedSsid: '',
    HostName: 'raspberry pi',
    AddressSource: 'DHCP',
    isLocalDevice: '0',
    LeaseTime: '82358',
    ID: '2',
    InterfaceType: 'Wireless',
    AssociatedTime: '4041',
    IpAddress: '192.168.8.5'
    }
]
```
## Wireless hostList
```js
[
  {
    MacAddress: 'AA:BB:CC:DD:EE:22',
    ID: '1',
    IpAddress: '192.168.8.5',
    AssociatedSsid: 'myWifi',
    AssociatedTime: '225131',
    HostName: 'mobile phone'
  },
  {
    MacAddress: 'B0:2A:43:4F:7F:05',
    ID: '2',
    IpAddress: '192.168.8.7',
    AssociatedSsid: 'myWifi',
    AssociatedTime: '5774',
    HostName: 'IOT device'
  }
]
```
## signal
```js
{
  pci: '35',
  sc: '',
  cell_id: '6687',
  rsrq: '-4dB',
  rsrp: '-81dBm',
  rssi: '-55dBm',
  sinr: '12dB',
  rscp: '',
  ecio: '',
  mode: '7',
  ulbandwidth: '20MHz',
  dlbandwidth: '20MHz',
  txpower: 'PPusch:-7dBm PPucch:-16dBm PSrs:0dBm PPrach:-7dBm',
  tdd: '',
  ul_mcs: 'mcsUpCarrier1:22',
  dl_mcs: 'mcsDownCarrier1Code0:19 mcsDownCarrier1Code1:18 ',
  earfcn: 'DL:200 UL:10',
  rrc_status: '1',
  rac: '',
  lac: '',
  tac: '2487',
  band: '1',
  nei_cellid: 'No1:323No2:..',
  plmn: '2381',
  ims: '0'
}
```
