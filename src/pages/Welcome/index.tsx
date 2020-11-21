import React, { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import 'cesium/Widgets/widgets.css';
import { useRequest } from '@umijs/hooks';
import { fetchFlightDetail } from "./service";
import styles from './index.less';
import { Table, Row, Col, Input, Button, Spin } from 'antd';



export default (): React.ReactNode => {
  const [flightData, setFlightData] = useState<string[]>([]);
  const [flightId, setFlightId] = useState<string>('89414de8-f9f7-41d9-83fa-5ea6be5a9eef');
  const [viewer, setViewer] = useState<any>(null);


  const handleChangeFlightId = (e:any) => {
    if (!e.target.value) return;
    console.log('val:::', e.target.value);
    setFlightId(e.target.value);
  }

  const {loading, run} = useRequest(fetchFlightDetail, {
    manual: true,
    onSuccess: res => {
      if (!res) return;
      setFlightData(res);
    }
  });

  useEffect(() => {
    Cesium.Ion.defaultAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NWI4ZGI3Zi0xYmM1LTQ2NmUtODBiZi05YWJiN2IzY2M4MTAiLCJpZCI6MzY2OTQsImlhdCI6MTYwMzkzMzY5Mn0.2LDJvHeCrCtf1_gyUuToe41PJYntAPAErRJowGcffD8';

    const viewerObj = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
    });
    setViewer(viewerObj);
    run(flightId);
  }, []);

  const handleSearchFlightDetail = useCallback(() => {
      run(flightId);
    },[flightId]
  )

  useEffect(
    () => {
      if(!flightData.length) return;
      renderFlight(flightData);
  }, [flightData]);

    const renderFlight = (flightList:string[]) => {
    
    viewer.entities.removeAll();

    viewer.scene.primitives.add(Cesium.createOsmBuildings());

    const timeStepInSeconds = 30;
    const totalSeconds = timeStepInSeconds * (flightList.length - 1);
    const start = Cesium.JulianDate.fromIso8601('2020-03-09T23:10:00Z');
    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.timeline.zoomTo(start, stop);
    // Speed up the playback speed 50x.
    viewer.clock.multiplier = 50;
    // Start playing the scene.
    viewer.clock.shouldAnimate = true;

    // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
    const positionProperty = new Cesium.SampledPositionProperty();

    for (let i = 0; i < flightList.length; i++) {
      const dataPoint = flightList[i];

      // Declare the time for this individual sample and store it in a new JulianDate instance.
      const time = Cesium.JulianDate.addSeconds(
        start,
        i * timeStepInSeconds,
        new Cesium.JulianDate(),
      );
      const position = Cesium.Cartesian3.fromDegrees(
        dataPoint.longitude,
        dataPoint.latitude,
        dataPoint.height,
      );
     
      positionProperty.addSample(time, position);

      viewer.entities.add({
        description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
        position: position,
        point: { pixelSize: 10, color: Cesium.Color.RED },
      });
    }

    async function loadModel() {
      // Load the glTF model from Cesium ion.
      const airplaneUri = await Cesium.IonResource.fromAssetId('181708');
      const airplaneEntity = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({ start: start, stop: stop }),
        ]),
        position: positionProperty,
        // Attach the 3D model instead of the green point.
        model: { uri: airplaneUri },
        // Automatically compute the orientation from the position.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({ width: 3 }),
      });

      viewer.trackedEntity = airplaneEntity;
    }

    loadModel();

  }

  const handleCheckDetail = (val: any) => {
    console.log('check Detail', val);
  };

  const dataSource = [
    {
      ID: '123123',
      name: 'ray',
      date: '2019-10-20',
    },
    {
      ID: '123123',
      name: 'ray',
      date: '2019-10-20',
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'ID',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '操作',
      render: (val: any) => (
        <Button onClick={() => handleCheckDetail(val)} type="primary">
          查看详情
        </Button>
      ),
    },
  ];

  const sceneColumns = [
    {
      title: '场压',
      dataIndex: 'fieldPressure',
      key: 'fieldPressure',
    },
    {
      title: '真空速',
      dataIndex: 'vacuumVelocity',
      key: 'vacuumVelocity',
    },
    {
      title: '即使速',
      dataIndex: 'imSpeed',
      key: 'imSpeed',
    },
    {
      title: 'TCAS',
      dataIndex: 'TCAS',
      key: 'TCAS',
    },
    {
      title: 'TAWS',
      dataIndex: 'TAWS',
      key: 'TAWS',
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
    },
    {
      title: '待飞距',
      dataIndex: 'waitingDistance',
      key: 'waitingDistance',
    },
    {
      title: '偏航角',
      dataIndex: 'yawAngle',
      key: 'yawAngle',
    },
  ];

  const sceneData = [
    {
      fieldPressure: '200',
      vacuumVelocity: '300',
      imSpeed: '1000',
      waitingDistance: '2000',
      yawAngle: '30',
    },
  ];

  return (
    <PageContainer>
      <div className={styles.tableContainer}>
        <Row style={{ padding: '20px 0' }}>
          <Col span={16}>
            <Input onChange={handleChangeFlightId} placeholder="请输入用户ID" />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearchFlightDetail}>查找</Button>
          </Col>
        </Row>
        <Table dataSource={dataSource} columns={columns} />
      </div>

      <div className={styles.sceneContainer}>
        <table className={styles.table} border='1'>
          <tr>
            <th>场压</th>
            <th>真空速</th>
            <th>即使速</th>
            <th>TCAS</th>
            <th>TAWS</th>
            <th>模式</th>
            <th>待飞距</th>
            <th>偏航角</th>
          </tr>
          <tbody>
            <tr>
              <td>200</td>
              <td>300</td>
              <td>1000</td>
              <td></td>
              <td></td>
              <td></td>
              <td>2000</td>
              <td>30</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Spin spinning={loading}>
        <div id="cesiumContainer" className={styles.cesiumContainer} />
      </Spin>
    </PageContainer>
  );
};
