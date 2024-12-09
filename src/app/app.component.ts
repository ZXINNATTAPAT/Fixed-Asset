import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { VERSION } from '@angular/material/core';
import { DataService } from '@services/data-service.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'ETC-ASE';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private dataService :DataService
  ) {
    this.titleService.setTitle(this.title);
    // iconSet singleton
    this.iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
 
      this.dataService.loadUserInfo(); // โหลดข้อมูล UserInfo เพียงครั้งเดียว
  
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }


  version = VERSION;

  // matSelectSearchVersion = MatSelectSearchVersion;

  private rightToLeft = false;

  toggleRightToLeft() {
    this.rightToLeft = !this.rightToLeft;
    document.body.dir = this.rightToLeft ? 'rtl' : '';
  }

}
