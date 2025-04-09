import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2><span class="anuphan-700">ถังขยะ</span></h2>
    <div class="table-responsive" *ngIf="deletedAssets.length > 0; else noData">
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อทรัพย์สิน</th>
            <th>การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let asset of deletedAssets">
            <td>{{ asset.id }}</td>
            <td>{{ asset.assetName }}</td>
            <td class="d-flex">
              <button class="btn btn-sm btn-primary m-1" (click)="viewAsset(asset.id)">
                <mat-icon>search</mat-icon>
              </button>
              <button class="btn btn-sm btn-warning m-1" (click)="restore(asset.id)">
                <mat-icon>restore</mat-icon>
              </button>
              <button class="btn btn-sm btn-danger m-1" (click)="openConfirmDialog(asset.id)">
                <mat-icon>delete_forever</mat-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #noData>
      <div class="alert alert-secondary text-center anuphan-700">ยังไม่มีข้อมูลในขณะนี้</div>
    </ng-template>
  `,
  styles: [`table { width: 100%; margin-top: 20px; }`]
})
export class TrashComponent implements OnInit {
  deletedAssets: any[] = [];

  assetService = inject(ApiService);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.assetService.assetService.getDeletedAssets().subscribe(data => this.deletedAssets = data);
  }

  viewAsset(id: number) {
    // assetDialog logic here
  }

  restore(id: number) {
    this.assetService.assetService.restoreAsset(id).subscribe(() => {
      this.deletedAssets = this.deletedAssets.filter(a => a.id !== id);
      this.dialog.open(DialogMessageComponent, { data: { message: 'กู้คืนข้อมูลเรียบร้อยแล้ว' } });
    });
  }

  openConfirmDialog(id: number) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '300px',
      data: { id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.assetService.assetService.deleteAssetPermanently(id).subscribe(() => {
          this.deletedAssets = this.deletedAssets.filter(a => a.id !== id);
          this.dialog.open(DialogMessageComponent, { data: { message: 'ข้อมูลถูกลบถาวรเรียบร้อยแล้ว' } });
        });
      }
    });
  }
}

@Component({
  selector: 'delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>ยืนยันการลบ</h2>
    <mat-dialog-content>คุณแน่ใจหรือไม่ว่าต้องการลบถาวร?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">ยกเลิก</button>
      <button mat-button color="warn" [mat-dialog-close]="true">ลบ</button>
    </mat-dialog-actions>
  `
})
export class DeleteConfirmationDialog {
  dialogRef = inject(MatDialogRef<DeleteConfirmationDialog>);
  data = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'dialog-message',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>แจ้งเตือน</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>ตกลง</button>
    </mat-dialog-actions>
  `
})
export class DialogMessageComponent {
  data = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-trash-dialog-wrapper',
  standalone: true,
  imports: [TrashComponent, MatDialogModule],
  template: `
    <div mat-dialog-content>
      <app-trash></app-trash>
    </div>
  `
})
export class TrashDialogWrapper {}

export function openTrashDialog(dialog: MatDialog): void {
  dialog.open(TrashDialogWrapper, {
    width: '850px',
    height: '600px'
  });
}