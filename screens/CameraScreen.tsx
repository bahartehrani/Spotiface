import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Icon from 'react-native-vector-icons/Ionicons';
import createPlaylist from '../Playlist';
import SpotifyWebApi from 'spotify-web-api-js';
//import createPlaylist from '../Playlist'

var photo: any = null;

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [faces, setFaces] = useState([]);
  const [pressed, setPressed] = useState(false);
  const [faceOnscreen, setFaceOnscreen] = useState(false);

  //TODO move this to earlier screen
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  //TODO make this better
  if (hasPermission !== true) {
    return <Text>No access to camera</Text>;
  }

  let takePic = async () => {
    if (this.camera) {
      this.camera.resumePreview();
      photo = await this.camera.takePictureAsync();
      this.camera.pausePreview();
      confirm();
      //setPressed(true);
    } else {
      console.log('camera not set.');
    }
  };

  let deny = () => {
    this.camera.resumePreview();
    setPressed(false);
    photo = null;
  };

  let confirm = () => {
    if (photo == null) {
      console.error('Photo not taken or set!');
      return;
    }

    FaceDetector.detectFacesAsync(photo.uri, {
      mode: FaceDetector.Constants.Mode.accurate,
      runClassifications: FaceDetector.Constants.Classifications.all,
      detectLandmarks: FaceDetector.Constants.Landmarks.none,
    })
      .then(({ faces, image }) => {
        setFaces(faces);
        //createPlaylist("dummy", photo.base64).then( // stop loading on lastscreen).then(stop loading)
      })
      .catch((error) => console.log('Failed to detect. error: \n' + error));

    //Move to last screen (send it promise)
    //FOR NOW,
    setPressed(false);
  };

  let onFaceDetected = (faces) => {
    if (faces.faces.length > 0) setFaceOnscreen(true);
    else setFaceOnscreen(false);
  };

  let generateNewness = (right, left) => {
    let fr = 0;
    let fl = 0;

    if (right > 0.35) {
      fr = 0.1;
    } else {
      fr = 0.7;
    }

    if (left > 0.35) {
      fl = 0.1;
    } else {
      fl = 0.7;
    }

    return 1 - (1 - fr) * (1 - fl);
  };

  let generateSmile = (sp) => {
    if (sp > 0.5) {
      return sp;
    } else {
      return 0;
    }
  };

  let valence = (sp, right, left) => {
    return (4 * (2 ** sp - 1)) / 5 + (right + left) / 10;
  };

  let energy = (sp, roll, right, left) => {
    return (
      (sp * Math.abs(roll) * (90 - Math.abs(roll))) / 8100 +
      generateSmile(sp) / 4 +
      (right + left) / 4
    );
  };

  if (pressed) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}
      >
        <View style={{ flex: 1, paddingBottom: 20 }}>
          <Camera
            style={{ flex: 1, marginBottom: 0, marginTop: 0 }}
            type="front"
            ref={(ref) => {
              this.camera = ref;
            }}
          />
        </View>
        {/* <TouchableOpacity
        onPress={takePic}
        style={{
        flex: 0.15,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 30,
        width: '80%',
        backgroundColor: '#DDD',
        }}
    >
        <Text style={{ fontSize: 25 }}>Snap</Text>
    </TouchableOpacity> */}
        <View style={{ paddingLeft: 15, paddingBottom: 10 }}>
          <Icon name="ios-beer" size={30} onPress={() => deny()}></Icon>
        </View>
        <View
          style={{
            position: 'absolute',
            marginBottom: 0,
            justifyContent: 'flex-end',
          }}
        >
          <Icon name="ios-beer" size={30} onPress={() => confirm()}></Icon>
        </View>
      </View>
    );
  } else {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}
      >
        <View style={{ flex: 1, paddingBottom: 20 }}>
          <Camera
            style={{ flex: 1, marginBottom: 0, marginTop: 0 }}
            type="front"
            onFacesDetected={onFaceDetected}
            ref={(ref) => {
              this.camera = ref;
            }}
          />
        </View>
        <Text style={{ fontSize: 17, paddingLeft: 5 }}>
          {JSON.stringify(
            faces[0],
            [
              'smilingProbability',
              'leftEyeOpenProbability',
              'rightEyeOpenProbability',
              'yawAngle',
              'rollAngle',
            ],
            '\n'
          )}
        </Text>
        <Text style={{ fontSize: 17, paddingBottom: 5 }}>
          Predicted Valence:{' '}
          {faces.length > 0 &&
            valence(
              faces[0].smilingProbability,
              faces[0].rightEyeOpenProbability,
              faces[0].leftEyeOpenProbability
            )}
          Predicted Energy:{' '}
          {faces.length > 0 &&
            energy(
              faces[0].smilingProbability,
              faces[0].rollAngle,
              faces[0].rightEyeOpenProbability,
              faces[0].leftEyeOpenProbability
            )}
          Predicted Newness:{' '}
          {faces.length > 0 &&
            generateNewness(
              faces[0].rightEyeOpenProbability,
              faces[0].leftEyeOpenProbability
            )}
        </Text>
        <TouchableOpacity
          onPress={takePic}
          style={{
            flex: 0.15,
            alignItems: 'center',
            justifyContent: 'center',
            margin: 30,
            width: '80%',
            backgroundColor: faceOnscreen ? 'green' : 'red',
          }}
        >
          <Text style={{ fontSize: 25 }}>Snap</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

export default CameraScreen;
