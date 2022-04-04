import { Subscription } from 'rxjs';

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FaceDetectionComponent, FaceDetectionService, getUserMedia, isMobile } from 'ngx-face-detection';
import { random } from 'mathjs';
// import {
//   FaceDetectionComponent,
//   FaceDetectionService,
//   isMobile,
//   getUserMedia
// } from "face-detection/src/public-api";

const img = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  isSuccess: boolean = false;
  loading = true;
  title = 'dev-face-camera';
  live = true;
  iris = false;
  debug = false;
  delay = 50;
  photo: string = img;
  rectPhoto: string = img;
  stream!: MediaStream;
  public isMobile = isMobile(window);

  tasks = [
    {
      task: 'facing left',
      title: 'Hadap Kiri',
      status: false,
    },
    {
      task: 'facing right',
      title: 'Hadap Kanan',
      status: false,
    },
    {
      task: 'head up',
      title: 'Hadap Atas',
      status: false,
    },
    {
      task: 'head down',
      title: 'Hadap Bawah',
      status: false,
    }
  ];

  activeTaskIndex: number = 0;
  activeTask: string = this.tasks[this.activeTaskIndex].task;

  status: boolean = false;

  videoMaxWidth = 1000;
  videoMaxHeight = 563;

  gestureDetected: boolean = false;

  get width() {
    return this.el.nativeElement.clientWidth || document.body.clientWidth;
  }

  get height() {
    return this.el.nativeElement.clientHeight || document.body.clientHeight;
  }

  // a subscription for screenshot of videos
  lastfaceDetectionSub!: Subscription;
  detectFaceGesture!: Subscription;

  @ViewChild(FaceDetectionComponent, { static: true }) faceDetection!: FaceDetectionComponent;
  @ViewChild('rectPhoto') rectPhotoEle!: ElementRef<HTMLImageElement>;

  constructor(
    private el: ElementRef<HTMLElement>,
    private faceDetectionService: FaceDetectionService
  ) {
  }

  getCamera() {
    try {
      const { width, height, videoMaxWidth, videoMaxHeight, isMobile } = this;
      getUserMedia(width, height, videoMaxWidth, videoMaxHeight, isMobile)
        .then(async media => {
          this.stream = media;
        });
    }
    catch (err) { }
  }

  ngOnInit(): void {
    this.getCamera();
    this.faceDetection.beginDetect$.subscribe(
      () => {
        this.loading = false;
        this.detectGesture();
      },
      error => {
        console.log('error when detection start');
      }
    );
  }

  detectGesture() {
    this.detectFaceGesture = this.faceDetection.detect$
      .subscribe((d) => {
        console.log('d: ', d);

        if (this.activeTaskIndex < this.tasks.length) {
          if (this.tasks[this.activeTaskIndex]) {
            d.gesture.find(obj => {
              if (obj.gesture === this.tasks[this.activeTaskIndex].task) {
                this.detectFaceGesture.unsubscribe();
                this.tasks[this.activeTaskIndex].status = true;
                this.gestureDetected = true;

                if (this.tasks[this.activeTaskIndex].status && this.activeTaskIndex < 3) {
                  setTimeout(() => {
                    this.activeTaskIndex++;
                    this.gestureDetected = false;

                    this.detectGesture();
                  }, 2000)
                }
                else {
                  if (this.detectFaceGesture) {
                    this.detectFaceGesture.unsubscribe();
                  }

                  this.isSuccess = true;

                  this.photo = img;
                  this.rectPhoto = img;

                  console.log(this.rect);

                  this.faceDetection.takePhoto(1500, 1500, this.rect, true)
                    .subscribe(result => {

                      const { photo, rectPhoto } = result;
                      this.photo = photo || img;
                      this.rectPhoto = rectPhoto || img;

                      console.log('result: ', result)
                    });
                }
              }
            });
          }
          else {
            this.isSuccess = true;
            this.takePhoto();

            this.detectFaceGesture.unsubscribe();
          }
        }
        else {
          this.isSuccess = true;
          this.takePhoto();

          this.detectFaceGesture.unsubscribe();
        }
      })

    // this.faceDetection.detect$.subscribe((d) => {
    //   if (this.activeTaskIndex < this.tasks.length) {
    //     d.gesture.find(obj => {
    //       if (obj.gesture === this.tasks[this.activeTaskIndex].task) {
    //         this.tasks[this.activeTaskIndex].status = true;

    //         if (this.tasks[this.activeTaskIndex].status) {
    //           this.activeTaskIndex++;
    //         }
    //       }
    //     });
    //   }
    //   else {
    //     this.isSuccess = true;
    //   }
    // })
  }

  ngAfterViewInit() {
    this.takePhoto();
  }

  preload() {
    this.faceDetectionService.preload({ live: this.live, iris: this.iris, debug: this.debug });
  }

  get rect() {
    return isMobile(window)
      ? {
        x: 0,
        y: 0,
        width: this.el.nativeElement.offsetWidth,
        height: this.el.nativeElement.offsetHeight
      }
      : {
        x: this.el.nativeElement.offsetWidth / 4,
        y: 0,
        width: this.el.nativeElement.offsetWidth / 2,
        height: this.el.nativeElement.offsetHeight
      };
  }

  takePhoto() {
    if (this.lastfaceDetectionSub) {
      this.lastfaceDetectionSub.unsubscribe();
    }
    this.photo = img;
    this.rectPhoto = img;
    console.log(this.rect);
    this.lastfaceDetectionSub = this.faceDetection.takePhoto(600, 800, this.rect, true).subscribe(result => {
      const { photo, rectPhoto } = result;
      this.photo = photo || img;
      this.rectPhoto = rectPhoto || img;
    });
  }

  takeBetterPhoto() {
    if (this.lastfaceDetectionSub) {
      this.lastfaceDetectionSub.unsubscribe();
    }
    this.photo = img;
    this.rectPhoto = img;
    this.lastfaceDetectionSub = this.faceDetection.takeBetterPhoto(600, 800, this.rect, true).subscribe(d => {
      const { photo, rectPhoto } = d;
      this.photo = photo || img;
      this.rectPhoto = rectPhoto || img;
      console.log('find a photo can be used');
    });
  }

  liveness(action: string) {
    if (this.lastfaceDetectionSub) {
      this.lastfaceDetectionSub.unsubscribe();
    }
    this.lastfaceDetectionSub = this.faceDetection.liveness(action as any, this.rect).subscribe(result => {
      console.log(result);
      console.log('successful liveness detection');
    });
  }

  livenessArray() {
    if (this.lastfaceDetectionSub) {
      this.lastfaceDetectionSub.unsubscribe();
    }
    this.lastfaceDetectionSub = this.faceDetection.livenessArray(['facingLeft', 'facingRight'], this.rect).subscribe(
      () => {
      },
      () => {
      },
      () => {
        console.log('successful liveness detection');
      }
    );
  }

  livenessArrayTakeBetterPhoto(action: any) {
    if (this.lastfaceDetectionSub) {
      this.lastfaceDetectionSub.unsubscribe();
    }
    this.photo = img;
    this.rectPhoto = img;
    this.lastfaceDetectionSub = this.faceDetection
      .livenessArrayTakeBetterPhoto(
        [action],
        600,
        800,
        this.rect,
        true
      )
      .subscribe(d => {
        const { photo, rectPhoto } = d;
        this.photo = photo || img;
        this.rectPhoto = rectPhoto || img;
        console.log('successful liveness detection');
      });
  }

  play() {
    this.faceDetection.play();
  }

  pause() {
    this.faceDetection.pause();
  }

  /**
   * can't find available video stream
   */
  noAvailableStream(res: boolean) {
    //
    console.log('no camera available')
  }
}
