import { Component, input, Signal } from '@angular/core';
import { Response } from '../../models/response';

@Component({
  selector: 'app-form-message',
  imports: [],
  templateUrl: './form-message.component.html',
  styleUrl: './form-message.component.scss'
})
export class FormMessageComponent {
  success = input.required<Response<string>>();
  errors = input.required<Array<string>>();
}
