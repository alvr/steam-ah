import {Component, OnInit} from '@angular/core'
import {Search} from '../models'
import {Http} from '@angular/http'

import {Converter, Result} from '../converter'
import {achievements, backgrounds, owned} from '../consts'

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/takeWhile'

@Component({
  selector: 'app-root',
  templateUrl: './search.component.html'
})

export class SearchComponent implements OnInit {
  search = new Search()
  submitted = false
  finished = false

  // Game list
  gamesIds = []
  gameList = []
  total_locked = 0
  total_unlocked = 0
  total_completed = 0
  without_achievements = 0

  // Sort table
  profile = ''
  isDesc = false
  column = 'locked'
  direction: number

  constructor(private http: Http) {
  }

  ngOnInit() {
    const background = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    const container = document.getElementById('main')
    container.style.background = `url(${background}) no-repeat fixed`
  }

  start() {
    this.reset()
    const convert: Result = new Converter(this.search.steamid, this.search.apikey).convert()

    if (convert.custom) {
      this.http.get(convert.steam).map(res => res.json()).subscribe(res => {
        if (res['response']['success'] === 1) {
          this.fetchGames(res['response']['steamid'])
        } else {
          alert(res['response']['desc'])
        }
      })
    } else {
      this.fetchGames(convert.steam)
    }
  }

  cancel() {
    this.reset()
    this.search = new Search()
  }

  sort(column: any) {
    this.isDesc = !this.isDesc
    this.column = column
    this.direction = this.isDesc ? 1 : -1
  }

  private reset() {
    this.gameList.length = 0
    this.gameList.length = 0
    this.total_locked = 0
    this.total_unlocked = 0
    this.total_completed = 0
    this.without_achievements = 0
    this.submitted = false
    this.finished = false
  }

  private fetchGames(user: string) {
    const url = owned.replace('{KEY}', this.search.apikey).replace('{USER}', user)

    this.http.request(url)
      .map(res => res.json())
      .takeWhile(() => !this.finished)
      .subscribe(res => {
        if (res['response']['success'] === 0) {
          alert(res['response']['desc'])
        } else {
          res['response']['games'].map(game => {
            this.gamesIds.push(game.appid)
          })
          this.submitted = true
          this.profile = user
          this.fetchAchievements(user, this.gamesIds)
        }
      })
  }

  private fetchAchievements(user: string, games: Array<string>) {
    games.forEach(async game => {
      const url = achievements.replace('{KEY}', this.search.apikey).replace('{USER}', user).replace('{GAME}', game)
      this.http.request(url)
        .map(res => res.json())
        .takeWhile(() => this.submitted)
        .subscribe(res => {
          if (res['response']['playerstats']['success'] === true) {
            let locked = 0
            let unlocked = 0

            try {
              res['response']['playerstats']['achievements'].forEach(ach => {
                if (ach['achieved'] === 1) {
                  unlocked++
                } else {
                  locked++
                }
              })
            } catch (TypeError) {
              this.without_achievements += 1
              console.log('App ' + game + ' doesn\'t have achievements.')
            }

            if (locked !== 0 || unlocked !== 0) {
              this.gameList.push({
                id: game,
                name: res['response']['playerstats']['gameName'],
                locked: locked,
                unlocked: unlocked,
                completed: +((unlocked / (unlocked + locked) * 100).toFixed(2))
              })

              this.gameList.sort((a, b) => b.locked - a.locked || a.unlocked - b.unlocked)
              this.total_locked += locked
              this.total_unlocked += unlocked
              this.total_completed = +((this.total_unlocked / (this.total_unlocked + this.total_locked) * 100).toFixed(2))
            }
          } else {
            this.without_achievements += 1
            console.log(res['response']['playerstats']['desc'])
          }
        })
    })
  }
}
