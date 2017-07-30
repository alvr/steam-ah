import {vanity} from './consts'

export interface Result {
  steam: string
  custom: boolean
}

export class Converter {

  constructor(private steamid: string, private key: string) { }

  public convert(): Result {
    if (new RegExp('^[0-9]{17}$').test(this.steamid)) {
      return {
        steam: this.steamid,
        custom: false
      }
    } else {
      return {
        steam: vanity.replace('{KEY}', this.key).replace('{USER}', this.steamid),
        custom: true
      }
    }
  }
}
