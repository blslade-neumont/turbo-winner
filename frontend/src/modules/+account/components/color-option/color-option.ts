import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ComponentBase } from 'utils/components';

@Component({
    selector: 'color-option',
    templateUrl: './color-option.html',
    styleUrls: ['./color-option.scss']
})
export class ColorOptionComponent extends ComponentBase {
    constructor() {
        super();
    }
    
    @Input() color: string = 'white';
    @Input('tab-index') tabIndex: number = -1;
    @Input('is-selected') isSelected: boolean = false;
    @Output() select = new EventEmitter<void>();
    
    @ViewChild('el') el: ElementRef;
    
    onClick() {
        this.fireSelect();
    }
    
    onKeyDown(e: KeyboardEvent) {
        if (!this.el || !this.el.nativeElement || document.activeElement !== this.el.nativeElement) return;
        if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
        if (e.code !== 'Space') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        this.fireSelect();
    }
    
    private fireSelect() {
        this.select.emit(void(0));
    }
}
