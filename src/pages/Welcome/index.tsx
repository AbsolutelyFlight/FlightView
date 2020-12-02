import React, { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import 'cesium/Widgets/widgets.css';
import { useRequest } from '@umijs/hooks';
import { fetchFlightDetail, fetchFlights, FlightItem, FlightListItem } from "./service";
import styles from './index.less';
import token from '../../utils/token'
import { Table, Button, Spin } from 'antd';



export default (): React.ReactNode => {
  const [flightData, setFlightData] = useState<FlightItem[]>([]);
  const [flightId, setFlightId] = useState<number>(0);
  const [flightList, setFlightList] = useState<FlightListItem[]>([]);
  const [viewer, setViewer] = useState<any>(null);

  const {loading, run: runFetchFlightDetail} = useRequest(fetchFlightDetail, {
    manual: true,
    onSuccess: res => {
      if (!res) return;
      setFlightData(res.path);
    }
  });

  const {loading: fetchFlightsLoading, run: runFetchFlights} = useRequest(fetchFlights, {
    manual: true,
    onSuccess: res => {
      if (!res) return;
      setFlightList(res);
    }
  });

  useEffect(() => {
    Cesium.Ion.defaultAccessToken = token;
    const viewerObj = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
    });
    setViewer(viewerObj);
    runFetchFlights();
  }, []);

  useEffect(
    () => {
      if(!flightData.length) return;
      renderFlight(flightData);
  }, [flightData]);

    const renderFlight = (flightList: FlightItem[]) => {

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

  const handleCheckDetail = (val: FlightListItem) => {
    console.log('check Detail', val);
    if (val) {
      setFlightId(val.flightId);
      runFetchFlightDetail(val.flightId);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
      render: (val: FlightListItem) => (
        <Button onClick={() => handleCheckDetail(val)} type="primary">
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className={styles.tableContainer}>
        {/* <Row style={{ padding: '20px 0' }}>
          <Col span={16}>
            <Input onChange={handleChangeFlightId} placeholder="请输入用户ID" />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearchFlightDetail}>查找</Button>
          </Col>
        </Row> */}
        <Table loading={fetchFlightsLoading} dataSource={flightList} columns={columns} />
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
