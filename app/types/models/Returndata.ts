export interface DataNode {
  code: string;
  data: {
    code: string;
    dataValue: number;
    dotcount: number;
    hasdata: boolean;
    strdata: string;
  };
  wds: Array<{
    valuecode: string;
    wdcode: string;
  }>;
}

export interface WDNode {
  nodes: Array<{
    code: string;
    cname: string;
    dotcount: number;
    exp: string;
    ifshowcode: boolean;
    memo: string;
    name: string;
    nodesort: string;
    sortcode: number;
    tag: string;
    unit: string;
  }>;
  wdcode: string;
  wdname: string;
}

export interface Returndata {
  datanodes: DataNode[];
  wdnodes: WDNode[];
  hasdatacount: number;
}