import { Component, Injectable } from '@angular/core';
import { batches } from './mock-batch';
import { HttpClient } from '@angular/common/http';
import { RequestOptions } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable()
export class AppComponent {
  message: string;
  statusFilterArg: string;
  statusOption = ["", "complete", "incomplete", "error"];
  // @todo angular mock response is fucking hard to comprehend
  // use this for testing for now
  batches = batches;
  constructor(private http: HttpClient) {
    // @todo this is copy-paste from mock-bat
    this.init();
  }
  private async init() {
    let data;
    try {
      data = await this.http.get<{
        data: Array<{
          "_id": number,
          "dateRange": {
            "start": Date,
            "end": Date,
          },
          "status": "complete" | "incomplete" | "error",
          "entryCount": number,
          "name": string,
        }>
      }>("/api/csv")
        .toPromise();
      this.batches = data.data;
    } catch (err) {
      console.error(err)
    }
  }
  name: string;
  csvFile: File; /* property of File type */
  fileNativeElement: any;
  fileChange(files: any) {
    this.csvFile = files[0];
    this.fileNativeElement = files[0].nativeElement;
  }
  onFilterSelect(statusFilterArg) {
    this.statusFilterArg = statusFilterArg;
  }
  /* Now send your form using FormData */
  async onSubmit(): Promise<void> {
    if(!this.name) {
      this.message= "no batch name";
      return;
    }
    if(!this.csvFile) {
      this.message= "no csv file";
      return;
    }
    let formData = new FormData();
    formData.append("name", this.name);
    formData.append("csvFile", this.csvFile, this.csvFile.name);
    // let headers = new Headers();
    try{
      await this.http.post("/api/csv", formData, {}).toPromise();
      this.message = "";
      this.init();
    } catch(err) {
      if (err.error && err.error.error) {
        this.message = err.error.error
      } else {
        this.message= "unexpected error";
        console.log(err);
      }
    }
  }
}
