export const indexArrayByProperty = function (array: any[], property: string): any {
    return array.reduce((obj, item, index) => {
        obj[item[property]] = item;
        return obj;
    }, {});
}

export const indexArrayByPropertyAndPosition = function (array: any[], property: string): any {
    return array.reduce((obj, item, index) => {
        obj[item[property]] = index;
        return obj;
    }, {});
}