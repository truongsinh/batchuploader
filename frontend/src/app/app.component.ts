import { Component } from '@angular/core';
import { batches } from './mock-batch';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  batches = batches;
}
