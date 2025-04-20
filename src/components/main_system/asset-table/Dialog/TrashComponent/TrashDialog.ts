import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA ,MatDialogModule} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { InfoassetComponent } from '../../../infoasset/infoasset.component';

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
            <th>การกระทำ</th>
            <th>รหัสครุภัณฑ์</th>
            <th>ชื่อครุภัณฑ์</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let asset of deletedAssets">
            <td class="d-flex">
              <button class="btn btn-sm btn-primary m-1" (click)="assetDialog(asset.AssetId)">
                <mat-icon>search</mat-icon>
              </button>
              <button class="btn btn-sm btn-warning m-1 text-white" (click)="restore(asset.AssetId)">
                <mat-icon>restore</mat-icon>
              </button>
              <button class="btn btn-sm btn-danger m-1 text-white" (click)="deleteAsset(asset.AssetId)">
                <mat-icon>delete_forever</mat-icon>
              </button>
            </td>
            <td>{{ asset.AssetCode }}</td>
            <td>{{ asset.AssetName }}</td>
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
    this.assetService.assetService.getDeletedAssets().subscribe(data => {
      this.deletedAssets = data;
    });
  }

  assetDialog(assetId: number): void {
    const dialogRef = this.dialog.open(InfoassetComponent, {
      width: '1200px',
      data: { id: assetId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('ผลลัพธ์จาก Dialog:', result);
      }
    });
  }

  restore(assetId: number): void {
    this.assetService.assetService.restoreAsset(assetId).subscribe(() => {
      this.deletedAssets = this.deletedAssets.filter(a => a.AssetId !== assetId);
      this.dialog.open(DialogMessageComponent, {
        data: { message: 'กู้คืนข้อมูลเรียบร้อยแล้ว' }
      });
    });
  }

  async deleteAsset(assetId: number): Promise<void> {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้ถาวรหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบถาวร',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        await this.assetService.assetService.deleteData(`AssetDetails/permanent/${assetId}`);
        this.deletedAssets = this.deletedAssets.filter(a => a.AssetId !== assetId);
        Swal.fire('ลบสำเร็จ!', 'สินทรัพย์ถูกลบถาวรแล้ว', 'success');
      } catch (error: any) {
        console.error('Error while deleting asset:', error);
        if (error.code === 'ERR_NETWORK') {
          Swal.fire('🌐 ข้อผิดพลาดเครือข่าย', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
        } else {
          Swal.fire('❌ เกิดข้อผิดพลาด', error.message || 'ไม่สามารถลบสินทรัพย์ได้', 'error');
        }
      }
    } else {
      Swal.fire('ยกเลิกแล้ว', 'ยังไม่มีการลบสินทรัพย์ใด ๆ', 'info');
    }
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
    width: '1050px',
    height: '600px'
  });
}