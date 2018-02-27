import { Pipe, PipeTransform } from '@angular/core';
import inspect = require('@aboveyou00/util-inspect');

@Pipe({
    name: 'inspect'
})
export class InspectPipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        return inspect(value, ...args);
    }
}
