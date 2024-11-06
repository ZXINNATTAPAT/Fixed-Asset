import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ContainerComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderModule,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  ProgressBarDirective,
  ProgressComponent,
  TextColorDirective,} from '@coreui/angular';
  import { HoneycombComponent } from '../../../dashboard/honeycomb/honeycomb.component';
  import { ThailandMapComponent} from '../../../dashboard/thailand-map/thailand-map.component'
  

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [AvatarComponent,HoneycombComponent,ThailandMapComponent,
    HeaderModule,
    BadgeComponent,
    BreadcrumbRouterComponent,
    ContainerComponent,
    DropdownDividerDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    DropdownMenuDirective,
    DropdownToggleDirective,
    HeaderComponent,
    HeaderNavComponent,
    HeaderTogglerDirective,
    NavItemComponent,
    NavLinkDirective,
    ProgressBarDirective,
    ProgressComponent,
    TextColorDirective,
    RouterModule
    ],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.scss'
})
export class MainpageComponent {

}
