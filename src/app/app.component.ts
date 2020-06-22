import { Component } from '@angular/core';
import { NgxAgoraService, StreamEvent, ClientEvent, Stream } from 'ngx-agora';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  localStream: Stream;

  remoteCalls: any = [];

  constructor(
    private agoraService: NgxAgoraService,
  ) {
    this.agoraService.createClient({
      codec: 'vp8',
      mode: 'live'
    });
  }

  join() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        let videoSource: any = mediaStream.getVideoTracks()[0];
        let audioSource: any = mediaStream.getAudioTracks()[0];
        this.agoraService.client.join(null, 'eyadali', null, (uid) => {
          this.localStream = this.agoraService.createStream({
            streamID: uid,
            audio: true,
            video: true,
            screen: false,
            videoSource: videoSource,
            audioSource: audioSource
          });

          this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
            console.log('accessAllowed');
          });
          // The user has denied access to the camera and mic.
          this.localStream.on(StreamEvent.MediaAccessDenied, () => {
            console.log('accessDenied');
          });
          this.localStream.init(
            () => {
              console.log('getUserMedia successfully');
              // this.localStream.play('agora_local');
              this.agoraService.client.publish(this.localStream, (err) =>
                console.log('Publish local stream error: ' + err)
              );
              this.agoraService.client.on(ClientEvent.LocalStreamPublished, (evt: any) => {
                console.log('Publish local stream successfully');
                let stream = evt.stream;
                console.log(`streaaaaaaaaaaaaaaaaaaaaam`, evt.stream.getId());
              });
            },
            (err) => console.log('getUserMedia failed', err)
          );
          this.agoraService.client.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
            console.log(`new stream added`);
            const stream = evt.stream as Stream;
            stream.play('agora_local');
            this.remoteCalls.push(stream.getId());
            if (!this.remoteCalls.includes(`agora_remote${stream.getId()}`))
              this.remoteCalls.push(`agora_remote${stream.getId()}`);
              setTimeout(() => stream.play(`agora_remote${stream.getId()}`), 1000);
          });
          this.agoraService.client.on(ClientEvent.RemoteStreamAdded, (evt) => {
            const stream = evt.stream as Stream;
            console.log(`streaaaam id`, evt);
            // this.agoraService.client.subscribe(stream, (erroor) => {
            //   console.log('Subscribe stream failed', erroor);
            // });
            this.agoraService.client.subscribe(stream, {video: true, audio: true})
          });
          
        });
      })
  }

  leave() {
    this.agoraService.client.leave(() => {
      console.log("Leavel channel successfully");
      this.localStream.stop();
    }, (err) => {
      console.log("Leave channel failed");
    });
  }

}
