import { FedLeaderboard, FedProfile } from "./Federation";
import { AddLogText } from "./Utils";

class Resource {
  args: any = {};
  constructor() {
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //--DEBUG DIALOG---------------------------------------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    (function () {
      if ((<any>window).omsPhase !== "gold") {
        document.addEventListener("document_ready", function () {
          (<any>window)._show_touchzone = !1;

          var Units = {
            vw: function (val: any) {
              return ((<any>window).innerWidth * val) / 100;
            },
            vh: function (val: any) {
              return ((<any>window).innerHeight * val) / 100;
            },
            vmax: function (val: any) {
              return (
                (Math.max((<any>window).innerHeight, (<any>window).innerWidth) *
                  val) /
                100
              );
            },
            vmin: function (val: any) {
              return (
                (Math.min((<any>window).innerHeight, (<any>window).innerWidth) *
                  val) /
                100
              );
            },
          };

          var ShowInfos = function () {
              var a = document.createElement("div");
              a.innerHTML =
                "<style> .info-close { position: absolute; padding: 5px; cursor: pointer; right: 0px; top: 0px; background-color: red; color: white; border: solid 1px lightcoral; } .info-context {position: absolute;     left: 50%;     top: 50%;     padding: 10px;     padding-top: 30px;     background-color: white;     z-index: 999999999;     border: solid 1px lightslategray;     transform: translate(-50%,-50%);     -webkit-transform: translate(-50%,-50%);     font-size: 11px;     font-family: monospace;} .show-cta { padding: 5px; cursor: pointer; background-color: red; color: white; border: solid 1px lightcoral; margin: 5px; border-radius: 5px; text-align:center; } </style>  ";
              var e = document.createElement("div");
              e.innerHTML = "X";
              e.className = "info-close";
              a.appendChild(e);
              var b = document.createElement("div");
              b.style.color = "red";
              b.innerHTML = "MID: " + ((<any>window).omsPID || "N/A") + "</br>";
              b.innerHTML += "Phase: " + (<any>window).omsPhase + "</br>";
              b.innerHTML += "Version: " + (<any>window).omsVersion + "</br>";
              b.innerHTML += "Game Version: " + "0.2.6" + "</br>";
              b.innerHTML +=
                "Creative ID: " +
                ((<any>window).creative_id || "N/A") +
                "</br>";
              b.innerHTML +=
                "Campaign ID: " +
                ((<any>window).campaign_id || "N/A") +
                "</br>";
              b.innerHTML +=
                "Anonymous: " + ((<any>window).anonymous || "n/a") + "</br>";
              b.innerHTML +=
                "FromCache: " + ((<any>window).fromCache || "n/a") + "</br>";
              a.appendChild(b);
              var d = document.createElement("div");
              d.className = "show-cta";
              d.innerHTML = (<any>window)._show_touchzone
                ? "Hide touch zones"
                : "Show touch zones";
              a.appendChild(d);

              var clearLB = document.createElement("div");
              clearLB.className = "show-cta";
              clearLB.innerHTML = "Clear my LB entry";
              clearLB.onclick = function () {
                let fedLeaderboard = new FedLeaderboard();
                fedLeaderboard
                  .DeleteMyEntry()
                  .then((response: any) => {
                    alert("Your LB entry was deleted!");
                  })
                  .catch((error: any) => {
                    alert(error);
                  });
              };
              a.appendChild(clearLB);

              var clearProfile = document.createElement("div");
              clearProfile.className = "show-cta";
              clearProfile.innerHTML = "Clear my profile";
              clearProfile.onclick = function () {
                let fedProfile = new FedProfile();
                fedProfile
                  .Save({})
                  .then((response: any) => {
                    alert("Your profile was deleted!");
                  })
                  .catch((error: any) => {
                    alert(error);
                  });
              };
              a.appendChild(clearProfile);

              e.onclick = function () {
                try {
                  document.body.removeChild(a);
                } catch (b) {}
              };
              d.onclick = function (a) {
                a.preventDefault();
                (<any>window)._show_touchzone = !(<any>window)._show_touchzone;
                (<any>window)._show_touchzone
                  ? (<any>window).showTouchZone &&
                    setTimeout((<any>window).showTouchZone, 1)
                  : (<any>window).hideTouchZone &&
                    setTimeout((<any>window).hideTouchZone, 1);
                d.innerHTML = (<any>window)._show_touchzone
                  ? "Hide touch zones"
                  : "Show touch zones";
                return !1;
              };
              a.className = "info-context";
              document.body.appendChild(a);
            },
            c = !1,
            start_touch = function (a: any) {
              c = !1;
              a = a.touches ? a.touches[0] : a;
              a.clientX < Units.vw(10) && a.clientY > Units.vh(50) && (c = !0);
            },
            end_touch = function (a: any) {
              a = a.changedTouches ? a.changedTouches[0] : a;
              c &&
                a.clientX > Units.vw(50) &&
                a.clientY > Units.vh(50) &&
                ShowInfos();
              c = !1;
            };

          let canvas = document.getElementById("GameCanvas");
          canvas.addEventListener("touchstart", start_touch);
          canvas.addEventListener("touchend", end_touch);
          canvas.addEventListener("mousedown", start_touch);
          canvas.addEventListener("mouseup", end_touch);
        });
      }
    })();

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    if ((<any>window).strStatsUrl) {
      let params = decodeURI(
        ((<any>window).strStatsUrl || "").split("?").pop()
      ).split("&");
      params.forEach((param) => {
        let data = param.split("=");
        this.args[data[0]] = decodeURIComponent(data[1]);
      });
    }

    // this.args["ad"] = this.BrowserCheck();
  }

  MobileAndTabletcheck() {
    var check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }

  BrowserCheck() {
    let os = "";
    let browser = "";

    // DETECT OS
    if (this.MobileAndTabletcheck()) {
      if (navigator.userAgent.search(/(iPad|iPhone|iphone|iPod)/) != -1) {
        os = "iOS";
      } else {
        os = "Android";
      }
    } else {
      if (navigator.platform.indexOf("Win") != -1) {
        os = "Windows";
      } else if (navigator.platform.indexOf("Mac") != -1) {
        os = "Mac";
      } else {
        os = "Unknown";
      }
    }

    //DETECT BROWSER
    if (navigator.userAgent.search(/(Firefox|FxiOS)/) != -1) {
      browser = "Firefox";
    } else if (navigator.userAgent.search(/(Opera|OPR|OPT)/) != -1) {
      browser = "Opera";
    } else if (navigator.userAgent.search(/(Edge|Edg)/) != -1) {
      browser = "Edge";
    } else if (navigator.userAgent.search(/(Chrome|CriOS)/) != -1) {
      browser = "Chrome";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
      browser = "Safari";
    } else {
      browser = "Browser";
    }

    return os + " - " + browser;
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  GetParam(key: string) {
    if ((<any>window).omsPublish) {
      if ((<any>window).omsParams[key]) {
        return (<any>window).omsParams[key];
      }
    }

    if ((<any>window)[key]) {
      return (<any>window)[key];
    }
    return key;
  }

  Request(
    method: string,
    url: string,
    body: string = null,
    responseType: XMLHttpRequestResponseType = null
  ) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);

      if (method == "post") {
        xhr.setRequestHeader("Content-type", "application/json");
      }

      if (responseType) {
        xhr.responseType = responseType;
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(xhr.response);
          } else {
            reject("error");
          }
        }
      };
      xhr.send(body);
    });
  }
}
export default new Resource();
