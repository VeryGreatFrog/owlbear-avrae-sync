/** Get the reverse domain name id for this plugin at a given path */
export function getPluginId(path: string) {
    return `verygreatfrog.owlbear.avrae-sync/${path}`;
  }
  
  export function isPlainObject(
    item: unknown
  ): item is Record<keyof any, unknown> {
    return (
      item !== null && typeof item === "object" && item.constructor === Object
    );
  }
  
  