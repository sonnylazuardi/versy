angular.module('starter.controllers', [])

.factory("Auth", function($firebaseAuth, FBURL) {
  var ref = new Firebase(FBURL);
  return $firebaseAuth(ref);
})

.controller('AppCtrl', function($scope, $ionicPopover, Auth, $state) {

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.auth = Auth;

    $scope.logout = function() {
        $scope.auth.$unauth();
    }

    $scope.auth.$onAuth(function(authData) {
        if (authData) {
          $scope.authData = authData;
        } else {
          $state.go('login');
        }
    });

})

.controller('DashCtrl', function($scope) {})

.controller('BrowseCtrl', function($scope, FBURL, $http, $state) {
    $scope.changeRoute = function(id) {
        $state.go('tab.detail', {id: id});
    }
    $scope.load = function() {
        $http.get('https://versy.firebaseio.com/images.json')
            .success(function (result) {
                var images = [];
                for (var k in result) {
                    if (!result[k]) continue;
                    var item = result[k];
                    item.id = k;
                    images.push(item);
                }
                $scope.images = images;
            });
    }
    $scope.load();

})

.controller('LoginCtrl', function($scope, $state,FBURL) {
  $scope.facebook = function() {
    var ref = new Firebase(FBURL);
    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        localStorage.setItem("authData",JSON.stringify(authData));
        console.log("Authenticated successfully with payload:", authData);
        ref.child("users").child(authData.uid).update({
            id:authData.uid,
            name: authData.facebook.displayName,
            email: authData.facebook.email,
            avatar: authData.facebook.cachedUserProfile.picture.data.url
        });
        localStorage.setItem('uid', authData.uid);
        $state.go('tab.timeline');
      }
    },{
        scope:"public_profile, email, user_friends"
    });
  }
  $scope.password = function() {
    var ref = new Firebase("https://versy.firebaseio.com");
    var email=document.getElementById("email").value;
    var password=document.getElementById("password").value;
    ref.createUser({
      email    : email,
      password : password
    }, function(error, userData) {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully created user account with uid:", userData);
        ref.child("users").child(userData.uid).update({
            id:userData.uid,
            email    : email
        });
      }
        ref.authWithPassword({
            email    : email,
            password : password
        }, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            localStorage.setItem("authData",JSON.stringify(authData));
            console.log("Authenticated successfully with payload:", authData);
            localStorage.setItem('uid', authData.uid);
            $state.go('tab.timeline');
          }
        });
    });
  }
})

.controller('TimelineCtrl', function($scope, $stateParams, $state, $q, $http, Auth) {
    $scope.timelines = [];
    $scope.empty = true;
    $scope.auth = Auth;
    $scope.auth.$onAuth(function(authData) {
        console.log('https://versy.firebaseio.com/users/'+localStorage.getItem('uid')+'/images/.json');
        $http.get('https://versy.firebaseio.com/users/'+localStorage.getItem('uid')+'/images/.json')
            .success(function (result) {
                var timelines = [];
                for (var k in result) {
                    if (!result[k]) continue;
                    var item = result[k];
                    item.id = k;
                    timelines.push(item);
                }
                $scope.timelines = timelines;
                if (timelines.length > 0) $scope.empty = false; else $scope.empty = true;
                // $scope.empty = false;
            });
    })

    $scope.load = function() {
        
    }
    $scope.load();
})

.controller('AccountCtrl', function($scope) {

})


.controller('DetailCtrl', function($scope, $stateParams, $http, FBURL, $q) {

    $scope.load = function() {
        $http.get('https://versy.firebaseio.com/images/'+$stateParams.id+'.json')
            .success(function (result) {
                $scope.devo = result;
                $scope.devo.id = $stateParams.id;
            });
    };
    $scope.load();
    
    $scope.comment = function(cText, image_id) {
        var defer = $q.defer();
        var authData = JSON.parse(localStorage.getItem("authData"));
        var comment = {
                text: cText,
         };
         console.log(authData.provider);
         if (authData.provider=="facebook"){
            comment.user_name=authData.facebook.displayName;
            comment.user_pp=authData.facebook.cachedUserProfile.picture.data.url;
         }
         else{
            comment.user_name=authData.password.email;
            comment.user_pp="img/nopp.png";
         }
         $http.post("https://versy.firebaseio.com/images/"+image_id+"/comments.json", comment)
            .success(function (res) {
                defer.resolve(res);
            });

        return defer.promise;
    };

    $scope.prayer = {
        message: '',
        submitPrayer: function() {
            $scope.comment($scope.prayer.message, $scope.devo.id).then(function() {
                $scope.prayer.message = '';
                $scope.load();
            });
            return false;
        },
    };
})


.controller('CreateCtrl', function($scope, $stateParams, $state, Fabric, FabricConstants, Keypress, $timeout, $cordovaCamera, $ionicModal, $http, $q, Devo) {
    $scope.view = {
        loading: false
    };
    $scope.devo = {
        verse: 'Psalm 19:1',
        font: 'Lobster',
        content: 'The heavens declare \n the glory of God',
        scripture: 'Psalm 19:1 - The heavens declare the glory of God; and the firmament sheweth his handywork.',
    };

    $scope.next = function() {
        $scope.save();
        $state.go('tab.create2');
    };

    $scope.save = function() {
        Devo.setDevo($scope.devo);
    };

    Keypress.onSave(function() {
        $scope.updatePage();
    });
})

.controller('Create2Ctrl', function($scope, $stateParams, $state, Fabric, FabricConstants, Keypress, $timeout, $cordovaCamera, $ionicModal, $http, $q, Devo, Auth) {
    $scope.fabric = {};
    $scope.FabricConstants = FabricConstants;
    $scope.auth = Auth;
    $scope.auth.$onAuth(function(authData) {
        $scope.authData = authData;
        console.log($scope.authData);
    });
    $scope.showColor = false;

    $scope.prev = function() {
        $state.go('tab.create');
    }

    $scope.next = function() {
        $scope.save().then(function() {
            $state.go('tab.create3');
        });
    }

    $ionicModal.fromTemplateUrl('templates/modal-bg.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
    });

    $scope.actions = {
        selectBg: function() {
            $scope.modal.show();
        },
        selectColor: function(id) {
            $scope.activeColor = id;
            $scope.showColor = true;
        },
        onSelectBg: function(imageUrl) {
            $scope.clearCanvas();
            $scope.fabric.addImage(imageUrl).then(function() {
                $scope.placeText();
            });
            $scope.modal.hide();
        },
        onSelectColor: function(color) {
            console.log('color: ', color);
            if ($scope.activeColor == 0) {
                $scope.fabric.canvasBackgroundColor = color;
            } else {
                $scope.fabric.selectedObject.fill = color;
            }
            $scope.showColor = false;
        },
        captureImage: function() {
            var options = {
                quality: 90,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 360,
                targetHeight: 360,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation:true
            };

            $scope.clearCanvas();

            $cordovaCamera.getPicture(options).then(function(imageData) {
              $scope.fabric.addImage("data:image/jpeg;base64," + imageData).then(function() {
                $scope.placeText();
              });
            }, function(err) {
            });
        },
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.placeText = function() {
        $scope.fabric.addCustomText($scope.devo.content, 180, 38);
        $scope.fabric.addCustomText($scope.devo.verse, 290, 28);
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.clearCanvas = function() {
        $scope.fabric.clearCanvas(); $scope.fabric.setDirty(true);
    };

    $scope.addImageUpload = function(data) {
        var obj = angular.fromJson(data);
        $scope.addImage(obj.filename);
    };

    $scope.changeFont = function() {
        $scope.fabric.deactivateAll();
    };

    $scope.canvas = {
        image: ''
    };

    $scope.selectCanvas = function() {
        $scope.canvasCopy = {
            width: $scope.fabric.canvasOriginalWidth,
            height: $scope.fabric.canvasOriginalHeight
        };
    };

    $scope.setCanvasSize = function() {
        $scope.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
        $scope.fabric.setDirty(true);
        delete $scope.canvasCopy;
    };

    //
    // Init
    // ================================================================
    $scope.init = function() {
        $scope.fabric = new Fabric({
            JSONExportProperties: FabricConstants.JSONExportProperties,
            textDefaults: FabricConstants.textDefaults,
            shapeDefaults: FabricConstants.shapeDefaults,
            json: {}
        });

        $scope.placeText();
    };


    $scope.load = function() {
        $scope.devo = Devo.getDevo();
    };
    $scope.load();

    $scope.save = function() {
        var def = $q.defer();

        $http({
            url:'http://busintime.id:5001/versy/upload',
            method:'POST',
            data:JSON.stringify({file: $scope.fabric.getImageData()}),
            headers:{'Content-Type':'application/json'}
        }).success(function (res) {
            var authData = JSON.parse(localStorage.getItem("authData"));
            if (authData.provider=="facebook"){
                authData.user_name=authData.facebook.displayName;
                authData.user_pp=authData.facebook.cachedUserProfile.picture.data.url;
            }
            else{
                authData.user_name=authData.password.email;
                authData.user_pp="img/nopp.png";
            }
            var devo = {
                verse: $scope.devo.verse,
                content: $scope.devo.content,
                scripture: $scope.devo.scripture,
                image: res,
                user: localStorage.getItem('uid'),
                user_name: authData.user_name,
                user_pp: authData.user_pp,
            };
            $http.post('https://versy.firebaseio.com/images.json', devo).success(function (result) {
                devo.id = result.name;
                Devo.setDevo(devo);
                $http.put('https://versy.firebaseio.com/users/'+devo.user+'/images/'+devo.id+'.json', devo).success(function (result) {
                    def.resolve(result);
                });
            });

        })
        .error(function (reponse) {
            console.log(response);
        });

        return def.promise;
    };

    $scope.$on('canvas:created', $scope.init);
})

.controller('Create3Ctrl', function($scope, $stateParams, $state, Fabric, FabricConstants, Keypress, $timeout, $cordovaCamera, $ionicModal, $http, $q, Devo, Auth) {
    $scope.prev = function() {
        $state.go('tab.create2');
    }

    $scope.auth = Auth;
    $scope.auth.$onAuth(function(authData) {
        $scope.auth = authData;
    });

    $scope.devo = {};
    $scope.load = function() {
        $scope.devo = Devo.getDevo();
        console.log($scope.devo);
    };
    $scope.load();

    $scope.save = function() {
        
        var devo = {
            id: $scope.devo.id,
            scripture: $scope.devo.scripture,
            observation: $scope.devo.observation,
            application: $scope.devo.application,
            prayer: $scope.devo.prayer,
        };

        $http.patch('https://versy.firebaseio.com/images/'+devo.id+'.json', devo).success(function (result) {
            $state.go('tab.timeline');
        });
    }
})

.controller('CardCtrl', function($scope, TDCardDelegate) {
  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    $scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    $scope.addCard();
  };
});;
