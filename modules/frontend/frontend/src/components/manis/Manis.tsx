import * as React from "react";
import { Component, useEffect, useState } from "react";
import "./Manis.css";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import useWebsocket, { ReadyState } from "react-use-websocket";
import Checkbox from "@material-ui/core/Checkbox";
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import * as Plotly from "plotly.js";
import * as ManisProtos from "./proto";

// const vec3 = z.tuple([z.number(), z.number(), z.number()]);
// const vec4 = z.tuple([z.number(), z.number(), z.number(), z.number()]);

// const entitySchema = z.object({
//   label: z.string(),
//   mode: z.string(),
//   world_pose_entity: z.object({
//     rotation: vec4,
//     translation: vec3,
//   }),
//   colors: z.array(vec4),
//   vertices: z.array(vec3),
// });
// type Entity = z.infer<typeof entitySchema>;
// const entityWrapperSchema = z.object({ Entity: entitySchema });
// type EntityWrapper = z.infer<typeof entityWrapperSchema>;
// const clearSchema = z.object({});
// type Clear = z.infer<typeof clearSchema>;
// const clearWrapperSchema = z.object({ Clear: clearSchema });
// type ClearWrapper = z.infer<typeof clearWrapperSchema>;
// const setPoseSchema = z.object({
//   label: z.string(),
//   world_pose_entity: z.object({
//     rotation: vec4,
//     translation: vec3,
//   }),
// });
// type SetPose = z.infer<typeof setPoseSchema>;
// const setPoseWrapperSchema = z.object({ SetPose: setPoseSchema });
// type SetPoseWrapper = z.infer<typeof setPoseWrapperSchema>;
// const removeSchema = z.object({
//   label: z.string(),
// });
// type Remove = z.infer<typeof removeSchema>;
// const removeWrapperSchema = z.object({ Remove: removeSchema });
// type RemoveWrapper = z.infer<typeof removeWrapperSchema>;
// const widgetUpdateSchema = z.union([
//   entityWrapperSchema,
//   clearWrapperSchema,
//   setPoseWrapperSchema,
//   removeWrapperSchema]);
// const widgetUpdateArraySchema = z.array(widgetUpdateSchema);
// type WidgetUpdateArray = z.infer<typeof widgetUpdateArraySchema>;

// const f64SliderSchema = z.object({
//   label: z.string(),
//   default: z.number(),
//   min: z.number(),
//   max: z.number(),
// })
// type F64Slider = z.infer<typeof f64SliderSchema>;
// const f64SliderWrapperSchema = z.object({ F64Slider: f64SliderSchema });
// type F64SliderWrapper = z.infer<typeof f64SliderWrapperSchema>;

// const checkboxSchema = z.object({
//   label: z.string(),
//   checked: z.boolean(),
// })
// type Checkbox = z.infer<typeof checkboxSchema>;
// const CheckboxWrapperSchema = z.object({ Checkbox: checkboxSchema });
// type CheckboxWrapper = z.infer<typeof CheckboxWrapperSchema>;

// const componentSchema = z.union([f64SliderWrapperSchema, CheckboxWrapperSchema]);
// const componentArraySchema = z.array(componentSchema);
// type ComponentArray = z.infer<typeof componentArraySchema>;

// const widetDataSchema = z.object(
//   {
//     label: z.string(),
//     update: widgetUpdateArraySchema,
//   }
// )
// const widgetDataWrapperSchema = z.object(
//   { WidgetData: widetDataSchema }
// );
// type WidgetDataWrapper = z.infer<typeof widgetDataWrapperSchema>;

// const newWidgetSchema = z.object({
//   label: z.string()
// });
// type newWidget = z.infer<typeof newWidgetSchema>;
// const newWidgetWrapperSchema = z.object({ NewWidget: newWidgetSchema });
// type NewWidgetWrapper = z.infer<typeof newWidgetWrapperSchema>;

// const dataSchema = z.union([
//   widgetDataWrapperSchema,
//   newWidgetWrapperSchema
// ]);
// const dataArraySchema = z.array(dataSchema);
// type DataArray = z.infer<typeof dataArraySchema>;

// const updateBufferSchema = z.object({
//   components: componentArraySchema,
//   widgets_data: dataArraySchema,
// })

// const f64SliderEventSchema
//   = z.object({
//     label: z.string(),
//     value: z.number(),
//   });
// const f64SliderEventWrapperSchema = z.object({ F64SliderEvent: f64SliderEventSchema });
// type F64SliderEventWrapper = z.infer<typeof f64SliderEventWrapperSchema>;

// const checkboxEventSchema
//   = z.object({
//     label: z.string(),
//     checked: z.boolean(),
//   });
// const checkboxEventWrapperSchema = z.object({ CheckboxEvent: checkboxEventSchema });
// type CheckboxEventWrapper = z.infer<typeof checkboxEventWrapperSchema>;

// const useElementDimensions = (myRef: RefObject<{ current: HTMLHeadingElement; }>) => {
//   let getDimensions = () => {
//     if (myRef.current) {
//       return {
//         width: myRef.current.offsetWidth,
//         height: myRef.current.offsetHeight
//       };
//     }
//     return {
//       width: 0,
//       height: 0,
//     }
//   }

//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   useEffect(() => {
//     const handleResize = () => {
//       setDimensions(getDimensions())
//     }

//     if (myRef.current) {
//       setDimensions(getDimensions())
//     }

//     window.addEventListener("resize", handleResize)

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     }
//   }, [myRef])

//   return dimensions;
// }

// function Grid() {
//   const componentRef = useRef<HTMLHeadingElement>(null)
//   const { width, height } = useElementDimensions(componentRef);
//   return (
//     <div>
//       width: {width}, height: {height}
//     </div>
//   )
// }

const useStyles = makeStyles((theme: any) =>
  createStyles({
    root: {
      height: "100%",
      width: "99%",
    },
    grid: {
      height: "95vh",
    },
    paperleft: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
      height: "100%",
    },
    paperright: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
      background: "#bbbbbb",
      height: "100vh",
    },
  })
);

type ParentProps = {
  label: string;
};

type ParentState = {
  container: HTMLDivElement | null;
  width: number;
  height: number;
};

class Parent extends Component<ParentProps, ParentState> {
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    1,
    0.1,
    1000
  );
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  scene: THREE.Scene = new THREE.Scene();
  controls: OrbitControls | null = null;

  state: ParentState = {
    container: null,
    width: 0,
    height: 0,
  };

  constructor(props: ParentProps) {
    super(props);
  }

  componentDidMount() {
    this.camera = new THREE.PerspectiveCamera(120, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    const container = document.getElementById(this.props.label);
    if (!container) {
      return;
    }
    container.appendChild(this.renderer.domElement);
    // var geometry = new THREE.BoxGeometry(1, 1, 1);
    // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //var cube = new THREE.Mesh(geometry, material);
    //this.scene.add(cube);
    this.camera.position.z = 5;
    const thiz = this;
    var animate = function () {
      requestAnimationFrame(animate);
      //thiz.resizeCanvasToDisplaySize();
      //cube.rotation.x += 0.01;
      //cube.rotation.y += 0.01;
      thiz.renderer.render(thiz.scene, thiz.camera);
      if (thiz.controls) {
        thiz.controls.update();
      }
    };
    animate();

    window.onresize = () => {
      let w = 0;
      let h = 0;
      if (this.state.container) {
        let container: HTMLDivElement = this.state.container;
        w = container.clientWidth;
        h = container.clientHeight;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
      this.setState({
        width: w,
        height: h,
      });
    };
    let w = 0;
    let h = 0;
    if (this.state.container) {
      let container: HTMLDivElement = this.state.container;
      w = container.clientWidth;
      h = container.clientHeight;

      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
    this.setState({
      width: w,
      height: h,
    });
  }

  handleEntity(entity: ManisProtos.Entity) {
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
    });

    const geometry = new THREE.BufferGeometry();
    var vertex_list = new Float32Array(3 * entity.vertices.length);
    var i = 0;
    for (var point of entity.vertices) {
      //for (var j = 0; j < 3; ++j) {
      vertex_list[i] = point;
      i += 1;
      //}
    }
    var color_list = new Float32Array(4 * entity.colors.length);
    i = 0;
    for (var color of entity.colors) {
      //for (var j = 0; j < 4; ++j) {
      color_list[i] = color;
      i += 1;
      //}
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertex_list, 3)
    );
    geometry.setAttribute("color", new THREE.BufferAttribute(color_list, 4));

    const line = new THREE.LineSegments(geometry, material);
    line.position.set(
      entity.worldPoseEntity!.translation!.x,
      entity.worldPoseEntity!.translation!.y,
      entity.worldPoseEntity!.translation!.z
    );
    line.quaternion.set(
      entity.worldPoseEntity!.rotation!.i,
      entity.worldPoseEntity!.rotation!.j,
      entity.worldPoseEntity!.rotation!.k,
      entity.worldPoseEntity!.rotation!.w
    );
    line.name = entity.label;
    this.scene.add(line);
  }

  handleClear() {
    this.scene.clear();
  }

  handleSetPose(setPose: ManisProtos.SetEntityPose) {
    var entity = this.scene.getObjectByName(setPose.label);
    console.log(setPose.label);

    if (entity !== undefined) {
      entity.position.set(
        setPose.worldPoseEntity!.translation!.x,
        setPose.worldPoseEntity!.translation!.y,
        setPose.worldPoseEntity!.translation!.z
      );
      entity.quaternion.set(
        setPose.worldPoseEntity!.rotation!.i,
        setPose.worldPoseEntity!.rotation!.j,
        setPose.worldPoseEntity!.rotation!.k,
        setPose.worldPoseEntity!.rotation!.w
      );
      entity.matrixWorldNeedsUpdate = true;
    }
  }

  handleRemove(remove: ManisProtos.RemoveEntity) {
    var entity = this.scene.getObjectByName(remove.label);
    console.log(remove);

    if (entity !== undefined) {
      this.scene.remove(entity);
    }
  }

  handleSceneUpdates(updates: ManisProtos.WidgetUpdate[]) {
    for (var entry of updates) {
      console.log(entry);
      if (entry.entity) {
        this.handleEntity(entry.entity);
      } else if (entry.clearWidget) {
        this.handleClear();
      } else if (entry.removeEntity) {
        this.handleRemove(entry.removeEntity);
      } else if (entry.setEntityPose) {
        this.handleSetPose(entry.setEntityPose);
      } else {
        console.log("bar");
      }
    }
  }

  render() {
    return (
      <div
        className="parent"
        style={{ height: "100%" }}
        ref={(e) => (this.state.container = e)}
      >
        <span>
          {" "}
          w: {this.state.width} h: {this.state.height}
        </span>
        <div id={this.props.label} />
      </div>
    );
  }
}

export function Manis() {
  const socketUrl = "ws://127.0.0.1:9001";
  const { sendMessage, readyState, getWebSocket } = useWebsocket(socketUrl, {
    onOpen: () => console.log("opened"),
    shouldReconnect: (_: CloseEvent) => true,
  });
  const ws = getWebSocket();

  const [componentList, setComponentList] = useState<Array<JSX.Element>>([]);
  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>(
    {}
  );
  const [widgetList, setWidgetList] = useState<Array<JSX.Element>>([]);
  const [widgetRefs, setWidgetRefs] = useState<
    Record<string, React.RefObject<Parent>>
  >({});

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  let handleSliderAdd = function (slider: ManisProtos.F64Slider) {
    const newSlider = (
      <div id={slider.label}>
        <Typography id="slider">{slider.label}</Typography>
        <Slider
          valueLabelDisplay="auto"
          min={slider.min}
          max={slider.max}
          aria-labelledby="slider"
          defaultValue={slider.default}
          step={0.001 * (slider.max - slider.min)}
          onChange={(_: object, value: number | number[]) => {
            let sl: ManisProtos.F64SliderEvent = {
              label: slider.label,
              value: value as number,
            };
            let ev: ManisProtos.Event = {
              checkboxEvent: undefined,
              f64SliderEvent: sl,
            };
            sendMessage(ManisProtos.Event.encode(ev).finish());
          }}
        >
          {slider.label}
        </Slider>
      </div>
    );
    setComponentList((oldArray) => [...oldArray, newSlider]);
  };

  let handleCheckboxAdd = function (checkbox: ManisProtos.Checkbox) {
    setCheckboxStates({
      ...checkboxStates,
      [checkbox.label]: checkbox.checked,
    });
    const newCheckbox = (
      <div id={checkbox.label}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxStates[checkbox.label]}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  console.log(event.target.checked);
                  console.log(checkboxStates[checkbox.label]);

                  setCheckboxStates({
                    ...checkboxStates,
                    [checkbox.label]: event.target.checked,
                  });

                  let ce: ManisProtos.CheckboxEvent = {
                    label: checkbox.label,
                    checked: checkbox.checked,
                  };
                  let ev: ManisProtos.Event = {
                    checkboxEvent: ce,
                    f64SliderEvent: undefined,
                  };
                  sendMessage(ManisProtos.Event.encode(ev).finish());
                  // const e: CheckboxEventWrapper = {
                  //   CheckboxEvent: {
                  //     label: checkbox.label,
                  //     checked: event.target.checked
                  //   }
                  // }
                  // sendMessage(JSON.stringify(e))
                }}
                inputProps={{ "aria-label": "primary checkbox" }}
              />
            }
            label={checkbox.label}
          />
        </FormGroup>
      </div>
    );
    setComponentList((oldArray) => [...oldArray, newCheckbox]);
  };

  let handleComponents = function (components: ManisProtos.Component[]) {
    for (var entry of components) {
      if (entry.checkbox) {
        handleCheckboxAdd(entry.checkbox);
      } else if (entry.f64Slider) {
        handleSliderAdd(entry.f64Slider);
      } else {
        console.log("hodfh");
      }
    }
  };

  let handleWidgets = function (widgets: ManisProtos.WidgetData[]) {
    for (var data of widgets) {
      let d: ManisProtos.WidgetData = data;
      if (d.newWidget) {
        let nw: ManisProtos.NewWidget = d.newWidget;
        const childRef: React.RefObject<Parent> = React.createRef();
        const newWidget = (
          <div id={nw.label}>
            <Grid item xs={10}>
              <Paper className={classes.paperright}>
                <Parent label={nw.label} ref={childRef}></Parent>{" "}
              </Paper>
            </Grid>
          </div>
        );

        setWidgetList((oldArray) => [...oldArray, newWidget]);
        setWidgetRefs((prev) => {
          console.log(prev);
          prev[nw.label] = childRef;
          return prev;
        });
      } else if (d.widgetUpdates) {
        const wu: ManisProtos.WidgetUpdates = d.widgetUpdates;
        const childRef = widgetRefs[wu.label];
        console.log(widgetRefs);
        childRef.current?.handleSceneUpdates(wu.updates);
      } else {
        console.log("huh??");
      }
    }
  };

  useEffect(() => {
    if (ws !== null) {
      ws.onmessage = (ev: MessageEvent) => {
        console.log(ev.data);

        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          let arrayBufferNew = event!.target!.result!;
          if (arrayBufferNew as ArrayBufferLike) {
            let uint8ArrayNew = new Uint8Array(
              arrayBufferNew as ArrayBufferLike
            );
            let update: ManisProtos.UpdateBuffer = ManisProtos.UpdateBuffer.decode(
              uint8ArrayNew
            );
            console.log(update);
            handleWidgets(update.widgetDataVec);
            handleComponents(update.componentVec);
          } else {
            console.log("bar");
          }
        };
        fileReader.readAsArrayBuffer(ev.data);

        // let foo = await ev.data.array.arrayBuffer();
        // let array = new Uint8Array(ev.data);
        // console.log(array);

        //fileReader.readAsArrayBuffer(ev.data);
        // let json = JSON.parse(ev.data);
        //console.log(ev.data);
        //const update = updateBufferSchema.parse(json);
        //
      };
    }
  });

  const classes = useStyles();

  const TESTER = document.getElementById("test");
  if (TESTER) {
    Plotly.newPlot(
      TESTER,
      [
        {
          x: [1, 2, 3, 4, 5],
          y: [1, 2, 4, 8, 16],
        },
      ],
      {
        margin: { t: 0 },
      }
    );
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={1}
        justify="space-between"
        alignItems="stretch"
        className={classes.grid}
      >
        <Grid item xs={2}>
          <Paper className={classes.paperleft}>
            {componentList}
            {connectionStatus}
          </Paper>
        </Grid>
        {widgetList}
        <Grid item xs={10}>
          <Paper className={classes.paperright}>
            <div id="test"></div>{" "}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
