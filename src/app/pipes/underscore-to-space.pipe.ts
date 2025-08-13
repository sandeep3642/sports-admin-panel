import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'underscoreToSpace', standalone: true })
export class UnderscoreToSpacePipe implements PipeTransform {
  transform(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    return stringValue.replace(/_/g, ' ');
  }
}
