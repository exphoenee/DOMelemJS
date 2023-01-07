export type attrType = { [key: string]: string | number };
export type attrsType = attrType | attrType[];

export type datasetType = { [key: string]: string };

type optionsType = {
  tag: string; //
  content?: string; //
  text?: string; //
  attrs?: attrsType; //
  style?: any; //
  children?: any; //
  parent?: any; //
  handleEvent?: any; //
  append?: boolean; //
};

export default optionsType;
