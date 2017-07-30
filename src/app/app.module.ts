import {BrowserModule} from '@angular/platform-browser'
import {NgModule} from '@angular/core'
import {HttpModule} from '@angular/http'
import {FormsModule} from '@angular/forms'

import {SearchComponent} from './search/search.component'
import {OrderPipe, PercentagePipe} from './pipes'

@NgModule({
  declarations: [
    SearchComponent,
    PercentagePipe,
    OrderPipe
  ],

  imports: [
    BrowserModule,
    HttpModule,
    FormsModule
  ],

  bootstrap: [
    SearchComponent
  ]
})

export class AppModule {}
